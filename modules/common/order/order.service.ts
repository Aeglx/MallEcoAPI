import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderLog } from './entities/order-log.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus, PayStatus, ShipStatus } from './enum/order-status.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderLog) private readonly orderLogRepository: Repository<OrderLog>,
  ) {}

  /**
   * 创建订单
   * @param createOrderDto 订单创建DTO
   * @returns 创建的订单
   */
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // 计算订单金额
    const totalAmount = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // 创建订单主表
    const order = this.orderRepository.create({
      ...createOrderDto,
      orderSn: this.generateOrderSn(),
      totalAmount,
      payAmount: totalAmount, // 假设没有折扣
      freightAmount: 0, // 假设免运费
      discountAmount: 0,
      orderStatus: OrderStatus.UNPAID, // 待付款
      payStatus: PayStatus.UNPAID, // 待付款
      shipStatus: ShipStatus.UNDELIVERED, // 待发货
    });

    // 保存订单主表
    const savedOrder = await this.orderRepository.save(order);

    // 创建订单商品项
    const orderItems = createOrderDto.items.map((item) => 
      this.orderItemRepository.create({
        orderId: savedOrder.id,
        ...item,
        totalPrice: item.price * item.quantity,
      })
    );

    // 保存订单商品项
    await this.orderItemRepository.save(orderItems);

    // 创建订单日志
    await this.createOrderLog(savedOrder.id, OrderStatus.UNPAID, PayStatus.UNPAID, ShipStatus.UNDELIVERED, '订单创建成功');

    return savedOrder;
  }

  /**
   * 获取所有订单列表
   * @returns 订单列表
   */
  async findAll(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: ['orderItems'],
    });
  }

  /**
   * 根据ID获取订单详情
   * @param id 订单ID
   * @returns 订单详情
   */
  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  /**
   * 更新订单信息
   * @param id 订单ID
   * @param updateOrderDto 订单更新DTO
   * @returns 更新后的订单
   */
  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    
    // 记录旧状态用于日志
    const oldOrderStatus = order.orderStatus;
    const oldPayStatus = order.payStatus;
    const oldShipStatus = order.shipStatus;

    // 更新订单信息
    const updatedOrder = this.orderRepository.merge(order, updateOrderDto);
    const savedOrder = await this.orderRepository.save(updatedOrder);

    // 创建订单日志
    await this.createOrderLog(
      id,
      savedOrder.orderStatus !== oldOrderStatus ? savedOrder.orderStatus : undefined,
      savedOrder.payStatus !== oldPayStatus ? savedOrder.payStatus : undefined,
      savedOrder.shipStatus !== oldShipStatus ? savedOrder.shipStatus : undefined,
      '订单信息更新',
    );

    return savedOrder;
  }

  /**
   * 删除订单
   * @param id 订单ID
   * @returns 删除结果
   */
  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }

  /**
   * 分页获取订单列表
   * @param page 页码
   * @param limit 每页数量
   * @returns 分页订单列表
   */
  async findByPage(page: number, limit: number): Promise<{ items: Order[]; total: number }> {
    const [items, total] = await this.orderRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['orderItems'],
    });
    return { items, total };
  }

  /**
   * 根据会员ID获取订单列表
   * @param memberId 会员ID
   * @returns 订单列表
   */
  async findByMemberId(memberId: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { memberId },
      relations: ['orderItems'],
    });
  }

  /**
   * 根据订单状态获取订单列表
   * @param orderStatus 订单状态
   * @returns 订单列表
   */
  async findByOrderStatus(orderStatus: number): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { orderStatus },
      relations: ['orderItems'],
    });
  }

  /**
   * 生成订单号
   * @returns 订单号
   */
  private generateOrderSn(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000); // 4位随机数
    return `${year}${month}${day}${hours}${minutes}${seconds}${random}`;
  }

  /**
   * 创建订单日志
   * @param orderId 订单ID
   * @param orderStatus 订单状态
   * @param payStatus 支付状态
   * @param shipStatus 发货状态
   * @param remark 备注
   * @returns 订单日志
   */
  private async createOrderLog(
    orderId: string,
    orderStatus?: number,
    payStatus?: number,
    shipStatus?: number,
    remark?: string,
  ): Promise<OrderLog> {
    const orderLog = this.orderLogRepository.create({
      orderId,
      orderStatus,
      payStatus,
      shipStatus,
      remark,
      operateTime: new Date(),
    });
    return await this.orderLogRepository.save(orderLog);
  }

  /**
   * 支付订单
   * @param orderSn 订单编号
   * @param payType 支付方式
   * @param payOrderNo 支付流水号
   * @returns 支付后的订单
   */
  async payOrder(orderSn: string, payType: string, payOrderNo: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderSn },
      relations: ['orderItems'],
    });

    if (!order) {
      throw new NotFoundException(`Order with SN ${orderSn} not found`);
    }

    if (order.orderStatus !== OrderStatus.UNPAID || order.payStatus !== PayStatus.UNPAID) {
      throw new BadRequestException('Order is not in unpaid status');
    }

    // 更新订单状态
    order.orderStatus = OrderStatus.PAID;
    order.payStatus = PayStatus.PAID;
    order.payType = payType;
    order.payTime = new Date();

    const updatedOrder = await this.orderRepository.save(order);

    // 创建订单日志
    await this.createOrderLog(
      order.id,
      OrderStatus.PAID,
      PayStatus.PAID,
      undefined,
      `订单支付成功，支付方式：${payType}，支付流水号：${payOrderNo}`,
    );

    return updatedOrder;
  }

  /**
   * 取消订单
   * @param orderSn 订单编号
   * @param cancelReason 取消原因
   * @returns 取消后的订单
   */
  async cancelOrder(orderSn: string, cancelReason: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderSn },
      relations: ['orderItems'],
    });

    if (!order) {
      throw new NotFoundException(`Order with SN ${orderSn} not found`);
    }

    if (order.orderStatus !== OrderStatus.UNPAID || order.payStatus !== PayStatus.UNPAID) {
      throw new BadRequestException('Only unpaid orders can be canceled');
    }

    // 更新订单状态
    order.orderStatus = OrderStatus.CANCELLED;
    order.payStatus = PayStatus.CANCEL;
    order.cancelTime = new Date();

    const updatedOrder = await this.orderRepository.save(order);

    // 创建订单日志
    await this.createOrderLog(
      order.id,
      OrderStatus.CANCELLED,
      PayStatus.CANCEL,
      undefined,
      `订单取消，取消原因：${cancelReason}`,
    );

    return updatedOrder;
  }

  /**
   * 发货
   * @param orderSn 订单编号
   * @param trackingNo 物流单号
   * @param logisticsCompany 物流公司
   * @returns 发货后的订单
   */
  async deliverOrder(orderSn: string, trackingNo: string, logisticsCompany: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderSn },
      relations: ['orderItems'],
    });

    if (!order) {
      throw new NotFoundException(`Order with SN ${orderSn} not found`);
    }

    if (order.orderStatus !== OrderStatus.PAID || order.payStatus !== PayStatus.PAID || order.shipStatus !== ShipStatus.UNDELIVERED) {
      throw new BadRequestException('Order is not in paid and undelivered status');
    }

    // 更新订单状态
    order.orderStatus = OrderStatus.DELIVERED;
    order.shipStatus = ShipStatus.DELIVERED;
    order.trackingNo = trackingNo;
    order.logisticsCompany = logisticsCompany;
    order.shipTime = new Date();

    const updatedOrder = await this.orderRepository.save(order);

    // 创建订单日志
    await this.createOrderLog(
      order.id,
      OrderStatus.DELIVERED,
      undefined,
      ShipStatus.DELIVERED,
      `订单发货，物流单号：${trackingNo}，物流公司：${logisticsCompany}`,
    );

    return updatedOrder;
  }

  /**
   * 确认收货
   * @param orderSn 订单编号
   * @returns 确认收货后的订单
   */
  async confirmOrder(orderSn: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderSn },
      relations: ['orderItems'],
    });

    if (!order) {
      throw new NotFoundException(`Order with SN ${orderSn} not found`);
    }

    if (order.orderStatus !== OrderStatus.DELIVERED || order.shipStatus !== ShipStatus.DELIVERED) {
      throw new BadRequestException('Order is not in delivered status');
    }

    // 更新订单状态
    order.orderStatus = OrderStatus.COMPLETED;
    order.shipStatus = ShipStatus.RECEIVED;
    order.receiveTime = new Date();

    const updatedOrder = await this.orderRepository.save(order);

    // 创建订单日志
    await this.createOrderLog(
      order.id,
      OrderStatus.COMPLETED,
      undefined,
      ShipStatus.RECEIVED,
      '订单已确认收货',
    );

    return updatedOrder;
  }

  /**
   * 根据订单编号获取订单
   * @param orderSn 订单编号
   * @returns 订单详情
   */
  async findByOrderSn(orderSn: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderSn },
      relations: ['orderItems'],
    });
    if (!order) {
      throw new NotFoundException(`Order with SN ${orderSn} not found`);
    }
    return order;
  }

  /**
   * 批量获取订单列表
   * @param orderIds 订单ID列表
   * @returns 订单列表
   */
  async findByIds(orderIds: string[]): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { id: { $in: orderIds } },
      relations: ['orderItems'],
    });
  }

  /**
   * 更新订单价格
   * @param orderSn 订单编号
   * @param updatePrice 更新后的价格
   * @returns 更新后的订单
   */
  async updateOrderPrice(orderSn: string, updatePrice: number): Promise<Order> {
    const order = await this.findByOrderSn(orderSn);

    // 更新订单价格
    order.totalAmount = updatePrice;
    order.payAmount = updatePrice;

    const updatedOrder = await this.orderRepository.save(order);

    // 创建订单日志
    await this.createOrderLog(
      order.id,
      undefined,
      undefined,
      undefined,
      `订单价格更新为：${updatePrice}`,
    );

    return updatedOrder;
  }
}
