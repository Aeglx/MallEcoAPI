import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, In } from 'typeorm';
import { Order } from '../../common/order/entities/order.entity';
import { OrderItem } from '../../common/order/entities/order-item.entity';
import { OrderLog } from '../../common/order/entities/order-log.entity';
import { QueryOrderDto, ShipOrderDto, BatchShipOrderDto } from './dto/order.dto';
import { OrderStatus, PayStatus, ShipStatus } from '../../common/order/enum/order-status.enum';
import { RabbitMQService } from '../../../../src/infrastructure/rabbitmq/rabbitmq.service';

@Injectable()
export class ManagerOrdersService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderLog) private orderLogRepository: Repository<OrderLog>,
    private rabbitMQService: RabbitMQService,
  ) {}

  /**
   * 获取订单列表
   */
  async getOrders(query: QueryOrderDto): Promise<any> {
    const { page = 1, limit = 10, orderSn, memberId, orderStatus, payStatus, shipStatus, startTime, endTime } = query;
    
    const whereConditions: any = {};
    
    if (orderSn) {
      whereConditions.orderSn = Like(`%${orderSn}%`);
    }
    
    if (memberId) {
      whereConditions.memberId = memberId;
    }
    
    if (orderStatus !== undefined && orderStatus !== -1) {
      whereConditions.orderStatus = orderStatus;
    }
    
    if (payStatus !== undefined) {
      whereConditions.payStatus = payStatus;
    }
    
    if (shipStatus !== undefined) {
      whereConditions.shipStatus = shipStatus;
    }
    
    if (startTime && endTime) {
      whereConditions.createdAt = Between(new Date(startTime), new Date(endTime));
    }
    
    const [orders, total] = await this.orderRepository.findAndCount({
      where: whereConditions,
      relations: ['orderItems'],
      order: { createTime: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    return {
      data: orders,
      total,
      page,
      limit,
    };
  }

  /**
   * 获取订单详情
   */
  async getOrderById(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems', 'orderLogs'],
    });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    
    return order;
  }

  /**
   * 根据订单编号获取订单
   */
  async getOrderByOrderSn(orderSn: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderSn },
      relations: ['orderItems', 'orderLogs'],
    });
    
    if (!order) {
      throw new NotFoundException(`Order with SN ${orderSn} not found`);
    }
    
    return order;
  }

  /**
   * 发货
   */
  async shipOrder(id: string, shipData: ShipOrderDto, operatorId: string, operatorName: string): Promise<Order> {
    const order = await this.getOrderById(id);
    
    // 检查订单状态
    if (order.orderStatus !== OrderStatus.UNDELIVERED) {
      throw new BadRequestException('Only pending shipment orders can be shipped');
    }
    
    if (order.payStatus !== PayStatus.PAID) {
      throw new BadRequestException('Only paid orders can be shipped');
    }
    
    // 更新订单信息
    order.shipStatus = ShipStatus.DELIVERED;
    order.orderStatus = OrderStatus.DELIVERED;
    order.shipTime = new Date();
    order.trackingNo = shipData.trackingNo;
    order.logisticsCompany = shipData.logisticsCompany;
    
    await this.orderRepository.save(order);
    
    // 记录订单日志
    await this.createOrderLog(
      order.id,
      operatorId,
      operatorName,
      OrderStatus.DELIVERED,
      order.payStatus,
      ShipStatus.DELIVERED,
      shipData.remark || `已发货，物流单号：${shipData.trackingNo}`,
    );
    
    // 发送消息队列
    await this.rabbitMQService.emit('order.ship', {
      orderId: order.id,
      orderSn: order.orderSn,
      memberId: order.memberId,
      trackingNo: shipData.trackingNo,
      logisticsCompany: shipData.logisticsCompany,
    });
    
    return order;
  }

  /**
   * 批量发货
   */
  async batchShipOrder(batchData: BatchShipOrderDto, operatorId: string, operatorName: string): Promise<{ success: number; failed: number; failedOrders: string[] }> {
    const { orderIds, trackingNo, logisticsCompany, remark } = batchData;
    let success = 0;
    let failed = 0;
    const failedOrders: string[] = [];
    
    for (const orderId of orderIds) {
      try {
        await this.shipOrder(orderId, { trackingNo, logisticsCompany, remark }, operatorId, operatorName);
        success++;
      } catch (error) {
        failed++;
        failedOrders.push(orderId);
      }
    }
    
    return { success, failed, failedOrders };
  }

  /**
   * 取消订单
   */
  async cancelOrder(id: string, remark: string, operatorId: string, operatorName: string): Promise<Order> {
    const order = await this.getOrderById(id);
    
    // 检查订单状态
    if (order.orderStatus !== OrderStatus.UNPAID) {
      throw new BadRequestException('Only pending payment orders can be cancelled');
    }
    
    // 更新订单信息
    order.orderStatus = OrderStatus.CANCELLED;
    order.cancelTime = new Date();
    
    await this.orderRepository.save(order);
    
    // 记录订单日志
    await this.createOrderLog(
      order.id,
      operatorId,
      operatorName,
      OrderStatus.CANCELLED,
      order.payStatus,
      order.shipStatus,
      remark || '管理员取消订单',
    );
    
    // 发送消息队列
    await this.rabbitMQService.emit('order.cancel', {
      orderId: order.id,
      orderSn: order.orderSn,
      memberId: order.memberId,
      reason: remark,
    });
    
    return order;
  }

  /**
   * 关闭订单
   */
  async closeOrder(id: string, remark: string, operatorId: string, operatorName: string): Promise<Order> {
    const order = await this.getOrderById(id);
    
    // 检查订单状态
    if (order.orderStatus !== OrderStatus.UNPAID) {
      throw new BadRequestException('Only pending payment orders can be closed');
    }
    
    // 更新订单信息
    order.orderStatus = OrderStatus.CANCELLED;
    
    await this.orderRepository.save(order);
    
    // 记录订单日志
    await this.createOrderLog(
      order.id,
      operatorId,
      operatorName,
      OrderStatus.CANCELLED,
      order.payStatus,
      order.shipStatus,
      remark || '系统自动关闭订单',
    );
    
    // 发送消息队列
    await this.rabbitMQService.emit('order.close', {
      orderId: order.id,
      orderSn: order.orderSn,
      memberId: order.memberId,
      reason: remark,
    });
    
    return order;
  }

  /**
   * 创建订单日志
   */
  private async createOrderLog(
    orderId: string,
    operatorId: string,
    operatorName: string,
    orderStatus: number,
    payStatus: number,
    shipStatus: number,
    remark: string,
  ): Promise<OrderLog> {
    const orderLog = this.orderLogRepository.create({
      orderId,
      operateId: operatorId,
      operateName: operatorName,
      operateTime: new Date(),
      orderStatus,
      payStatus,
      shipStatus,
      remark,
    });
    
    return this.orderLogRepository.save(orderLog);
  }

  /**
   * 获取订单统计数据
   */
  async getOrderStatistics(startTime: string, endTime: string): Promise<any> {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // 查询订单总数
    const totalOrders = await this.orderRepository.count({
      where: { createTime: Between(start, end) },
    });
    
    // 查询已完成订单数
    const completedOrders = await this.orderRepository.count({
      where: {
        createTime: Between(start, end),
        orderStatus: OrderStatus.COMPLETED,
      },
    });
    
    // 查询待处理订单数（待付款、待发货、待收货）
    const pendingOrders = await this.orderRepository.count({
      where: {
          createTime: Between(start, end),
          orderStatus: In([OrderStatus.UNPAID, OrderStatus.UNDELIVERED, OrderStatus.DELIVERED]),
        },
    });
    
    // 查询取消订单数
    const cancelledOrders = await this.orderRepository.count({
      where: {
        createTime: Between(start, end),
        orderStatus: OrderStatus.CANCELLED,
      },
    });
    
    // 查询订单总金额
    const orderAmountResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'totalAmount')
      .where('order.createdAt BETWEEN :start AND :end', { start, end })
      .getRawOne();
    
    // 查询实际支付金额
    const payAmountResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.payAmount)', 'payAmount')
      .where('order.createdAt BETWEEN :start AND :end AND order.payStatus = :payStatus', { 
        start, 
        end, 
        payStatus: PayStatus.PAID 
      })
      .getRawOne();
    
    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      totalAmount: parseFloat(orderAmountResult.totalAmount) || 0,
      payAmount: parseFloat(payAmountResult.payAmount) || 0,
    };
  }
}
