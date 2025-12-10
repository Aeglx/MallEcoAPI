import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { 
  OrderEntity, 
  OrderItemEntity, 
  OrderLogEntity, 
  OrderStatusEntity 
} from '../entities';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(OrderLogEntity)
    private readonly orderLogRepository: Repository<OrderLogEntity>,
    @InjectRepository(OrderStatusEntity)
    private readonly orderStatusRepository: Repository<OrderStatusEntity>,
  ) {}

  // 创建订单
  async createOrder(orderData: Partial<OrderEntity>, orderItems: Partial<OrderItemEntity>[]) {
    const order = this.orderRepository.create(orderData);
    const savedOrder = await this.orderRepository.save(order);

    // 创建订单项
    const items = orderItems.map(item => ({
      ...item,
      orderId: savedOrder.id,
      totalPrice: item.goodsPrice * item.goodsNum,
    }));
    
    await this.orderItemRepository.save(items);

    // 创建订单状态记录
    await this.orderStatusRepository.create({
      orderSn: savedOrder.orderSn,
      memberId: savedOrder.memberId,
      orderStatus: savedOrder.orderStatus,
      paymentStatus: savedOrder.paymentStatus,
      shippingStatus: savedOrder.shippingStatus,
      statusDescription: '订单创建成功',
    }).save();

    // 记录订单日志
    await this.orderLogRepository.create({
      orderId: savedOrder.id,
      memberId: savedOrder.memberId,
      logType: 'ORDER',
      logModule: 'CREATE',
      logContent: '订单创建成功',
      action: 'ORDER_CREATE',
      afterStatus: savedOrder.orderStatus,
    }).save();

    return savedOrder;
  }

  // 获取订单详情
  async getOrderById(orderId: string, memberId?: string) {
    const where: any = { id: orderId };
    if (memberId) {
      where.memberId = memberId;
    }

    const order = await this.orderRepository.findOne({
      where,
      relations: ['orderItems'],
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    return order;
  }

  // 根据订单号获取订单
  async getOrderBySn(orderSn: string, memberId?: string) {
    const where: any = { orderSn };
    if (memberId) {
      where.memberId = memberId;
    }

    const order = await this.orderRepository.findOne({
      where,
      relations: ['orderItems'],
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    return order;
  }

  // 获取用户订单列表
  async getUserOrders(memberId: string, params: {
    page?: number;
    pageSize?: number;
    orderStatus?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const {
      page = 1,
      pageSize = 10,
      orderStatus,
      startDate,
      endDate,
    } = params;

    const where: any = { memberId };
    if (orderStatus) {
      where.orderStatus = orderStatus;
    }
    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    }

    const [orders, total] = await this.orderRepository.findAndCount({
      where,
      relations: ['orderItems'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 获取商家订单列表
  async getStoreOrders(storeId: string, params: {
    page?: number;
    pageSize?: number;
    orderStatus?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const {
      page = 1,
      pageSize = 10,
      orderStatus,
      startDate,
      endDate,
    } = params;

    const where: any = { storeId };
    if (orderStatus) {
      where.orderStatus = orderStatus;
    }
    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    }

    const [orders, total] = await this.orderRepository.findAndCount({
      where,
      relations: ['orderItems'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 更新订单状态
  async updateOrderStatus(orderId: string, status: string, operatorId?: string, remark?: string) {
    const order = await this.getOrderById(orderId);
    const oldStatus = order.orderStatus;

    await this.orderRepository.update(orderId, {
      orderStatus: status,
      updatedAt: new Date(),
    });

    // 更新订单状态记录
    await this.orderStatusRepository.save({
      orderSn: order.orderSn,
      memberId: order.memberId,
      orderStatus: status,
      paymentStatus: order.paymentStatus,
      shippingStatus: order.shippingStatus,
      statusDescription: this.getStatusDescription(status),
      operatorId,
      remark,
    });

    // 记录订单日志
    await this.orderLogRepository.save({
      orderId: order.id,
      memberId: order.memberId,
      operatorId,
      logType: 'ORDER',
      logModule: 'STATUS',
      logContent: `订单状态从 ${oldStatus} 变更为 ${status}`,
      action: this.getStatusAction(status),
      beforeStatus: oldStatus,
      afterStatus: status,
    });

    return await this.getOrderById(orderId);
  }

  // 更新支付状态
  async updatePaymentStatus(orderId: string, paymentStatus: string, paymentInfo?: {
    paymentMethod?: string;
    paymentName?: string;
    payTime?: Date;
  }) {
    const updateData: any = {
      paymentStatus,
      updatedAt: new Date(),
    };

    if (paymentInfo) {
      Object.assign(updateData, paymentInfo);
    }

    await this.orderRepository.update(orderId, updateData);

    if (paymentStatus === 'PAID') {
      await this.updateOrderStatus(orderId, 'PAID', paymentInfo?.payTime ? 'system' : undefined, '支付成功');
    }

    return await this.getOrderById(orderId);
  }

  // 更新发货状态
  async updateShippingStatus(orderId: string, shippingInfo: {
    shippingStatus: string;
    shippingSn?: string;
    shippingCompany?: string;
    shippingTime?: Date;
  }) {
    await this.orderRepository.update(orderId, {
      shippingStatus: shippingInfo.shippingStatus,
      shippingSn: shippingInfo.shippingSn,
      shippingCompany: shippingInfo.shippingCompany,
      shippingTime: shippingInfo.shippingTime || new Date(),
      updatedAt: new Date(),
    });

    if (shippingInfo.shippingStatus === 'SHIPPED') {
      await this.updateOrderStatus(orderId, 'DELIVERED', undefined, '商品已发货');
    }

    return await this.getOrderById(orderId);
  }

  // 取消订单
  async cancelOrder(orderId: string, memberId: string, cancelReason: string) {
    const order = await this.getOrderById(orderId, memberId);

    if (order.orderStatus === 'PAID') {
      throw new Error('已支付订单无法取消');
    }

    await this.orderRepository.update(orderId, {
      orderStatus: 'CANCELLED',
      cancelReason,
      cancelTime: new Date(),
      updatedAt: new Date(),
    });

    await this.updateOrderStatus(orderId, 'CANCELLED', memberId, cancelReason);

    return await this.getOrderById(orderId);
  }

  // 确认收货
  async confirmReceive(orderId: string, memberId: string) {
    const order = await this.getOrderById(orderId, memberId);

    if (order.orderStatus !== 'DELIVERED') {
      throw new Error('当前订单状态不支持确认收货');
    }

    await this.orderRepository.update(orderId, {
      orderStatus: 'COMPLETED',
      receiveTime: new Date(),
      finishTime: new Date(),
      updatedAt: new Date(),
    });

    await this.updateOrderStatus(orderId, 'COMPLETED', memberId, '确认收货');

    return await this.getOrderById(orderId);
  }

  // 获取订单统计
  async getOrderStatistics(memberId: string) {
    const stats = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.orderStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(order.payPrice)', 'totalAmount')
      .where('order.memberId = :memberId', { memberId })
      .groupBy('order.orderStatus')
      .getRawMany();

    const result = {
      unpaid: { count: 0, amount: 0 },
      paid: { count: 0, amount: 0 },
      delivered: { count: 0, amount: 0 },
      completed: { count: 0, amount: 0 },
      cancelled: { count: 0, amount: 0 },
    };

    stats.forEach(stat => {
      const status = stat.status.toLowerCase();
      if (result[status]) {
        result[status].count = parseInt(stat.count);
        result[status].amount = parseFloat(stat.totalAmount) || 0;
      }
    });

    return result;
  }

  // 获取订单日志
  async getOrderLogs(orderId: string, memberId?: string) {
    const order = await this.getOrderById(orderId, memberId);
    
    return await this.orderLogRepository.find({
      where: { orderId: order.id },
      order: { createdAt: 'DESC' },
    });
  }

  private getStatusDescription(status: string): string {
    const descriptions = {
      'UNPAID': '待付款',
      'PAID': '已付款',
      'DELIVERED': '已发货',
      'COMPLETED': '已完成',
      'CANCELLED': '已取消',
    };
    return descriptions[status] || status;
  }

  private getStatusAction(status: string): string {
    const actions = {
      'UNPAID': 'ORDER_CREATE',
      'PAID': 'ORDER_PAY',
      'DELIVERED': 'ORDER_SHIP',
      'COMPLETED': 'ORDER_RECEIVE',
      'CANCELLED': 'ORDER_CANCEL',
    };
    return actions[status] || 'ORDER_UPDATE';
  }
}