import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, DataSource } from 'typeorm';
import { Order } from '../../common/order/entities/order.entity';
import { OrderItem } from '../../common/order/entities/order-item.entity';
import { OrderLog } from '../../common/order/entities/order-log.entity';
import { QueryOrderDto, DeliverOrderDto, UpdateOrderRemarkDto } from './dto/order.dto';
import { OrderStatus, PayStatus, ShipStatus } from '../../common/order/enum/order-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderLog) private readonly orderLogRepository: Repository<OrderLog>,
    private dataSource: DataSource,
  ) {}

  /**
   * 获取订单列表
   */
  async getOrderList(storeId: string, queryDto: QueryOrderDto) {
    const { orderSn, orderStatus, payStatus, shipStatus, consigneeName, consigneeMobile, startTime, endTime, page = 1, pageSize = 10 } = queryDto;
    
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .where('order.storeId = :storeId', { storeId })
      .leftJoinAndSelect('order.orderItems', 'orderItems');

    // 订单编号
    if (orderSn) {
      queryBuilder.andWhere('order.orderSn LIKE :orderSn', { orderSn: `%${orderSn}%` });
    }

    // 订单状态
    if (orderStatus !== undefined) {
      queryBuilder.andWhere('order.orderStatus = :orderStatus', { orderStatus });
    }

    // 支付状态
    if (payStatus !== undefined) {
      queryBuilder.andWhere('order.payStatus = :payStatus', { payStatus });
    }

    // 物流状态
    if (shipStatus !== undefined) {
      queryBuilder.andWhere('order.shipStatus = :shipStatus', { shipStatus });
    }

    // 收货人姓名
    if (consigneeName) {
      queryBuilder.andWhere('order.consigneeName LIKE :consigneeName', { consigneeName: `%${consigneeName}%` });
    }

    // 收货人电话
    if (consigneeMobile) {
      queryBuilder.andWhere('order.consigneeMobile LIKE :consigneeMobile', { consigneeMobile: `%${consigneeMobile}%` });
    }

    // 时间范围
    if (startTime && endTime) {
      queryBuilder.andWhere('order.createTime BETWEEN :startTime AND :endTime', { startTime, endTime });
    } else if (startTime) {
      queryBuilder.andWhere('order.createTime >= :startTime', { startTime });
    } else if (endTime) {
      queryBuilder.andWhere('order.createTime <= :endTime', { endTime });
    }

    // 分页
    queryBuilder.skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('order.createdAt', 'DESC');

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      items: orders,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取订单详情
   */
  async getOrderDetail(storeId: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, storeId },
      relations: ['orderItems'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  /**
   * 订单发货
   */
  async deliverOrder(storeId: string, orderSn: string, deliverDto: DeliverOrderDto) {
    const { trackingNo, logisticsCompany } = deliverDto;

    // 查找订单
    const order = await this.orderRepository.findOne({
      where: { orderSn, storeId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 检查订单状态
    if (order.orderStatus !== OrderStatus.UNDELIVERED) {
      throw new BadRequestException('当前订单状态不允许发货');
    }

    // 开始事务
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 更新订单状态
      order.shipStatus = ShipStatus.DELIVERED;
      order.orderStatus = OrderStatus.DELIVERED;
      order.trackingNo = trackingNo;
      order.logisticsCompany = logisticsCompany;
      order.shipTime = new Date();

      await queryRunner.manager.save(order);

      // 记录订单日志
      const orderLog = new OrderLog();
      orderLog.orderId = order.id;
      orderLog.operateId = storeId;
      orderLog.operateName = '商家发货';
      orderLog.operateTime = new Date();
      orderLog.orderStatus = order.orderStatus;
      orderLog.payStatus = order.payStatus;
      orderLog.shipStatus = order.shipStatus;
      orderLog.remark = `商家发货，物流单号：${trackingNo}，物流公司：${logisticsCompany}`;

      await queryRunner.manager.save(orderLog);

      // 提交事务
      await queryRunner.commitTransaction();

      return { success: true, message: '发货成功' };
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // 释放连接
      await queryRunner.release();
    }
  }

  /**
   * 修改订单备注
   */
  async updateOrderRemark(storeId: string, orderId: string, remarkDto: UpdateOrderRemarkDto) {
    const { remark } = remarkDto;

    // 查找订单
    const order = await this.orderRepository.findOne({
      where: { id: orderId, storeId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    // 更新备注
    order.remark = remark;
    await this.orderRepository.save(order);

    // 记录订单日志
    const orderLog = new OrderLog();
    orderLog.orderId = order.id;
    orderLog.operateId = storeId;
    orderLog.operateName = '商家修改备注';
    orderLog.operateTime = new Date();
    orderLog.orderStatus = order.orderStatus;
    orderLog.payStatus = order.payStatus;
    orderLog.shipStatus = order.shipStatus;
    orderLog.remark = `修改订单备注为：${remark}`;

    await this.orderLogRepository.save(orderLog);

    return { success: true, message: '备注修改成功' };
  }

  /**
   * 获取订单统计数据
   */
  async getOrderStatistics(storeId: string, startTime: string, endTime: string) {
    // 查询时间段内的订单
    const orders = await this.orderRepository.find({
      where: {
        storeId,
        createTime: Between(new Date(startTime), new Date(endTime)),
      },
    });

    // 统计数据
    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const paidOrders = orders.filter(order => order.payStatus === PayStatus.PAID).length;
    const deliveredOrders = orders.filter(order => order.shipStatus === ShipStatus.DELIVERED || order.shipStatus === ShipStatus.RECEIVED).length;
    const completedOrders = orders.filter(order => order.orderStatus === OrderStatus.COMPLETED).length;

    return {
      totalOrders,
      totalAmount,
      paidOrders,
      deliveredOrders,
      completedOrders,
      startTime,
      endTime,
    };
  }
}