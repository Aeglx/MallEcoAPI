import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderLog } from './entities/order-log.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus, PayStatus, ShipStatus } from './enum/order-status.enum';
import { OrderShardingService } from './sharding/order.sharding.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderLog) private readonly orderLogRepository: Repository<OrderLog>,
    private readonly orderShardingService: OrderShardingService,
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

    // 订单基本信息
    const orderBase = {
      ...createOrderDto,
      totalAmount,
      payAmount: totalAmount, // 假设没有折扣
      freightAmount: 0, // 假设免运费
      discountAmount: 0,
      orderStatus: OrderStatus.UNPAID, // 待付款
      payStatus: PayStatus.UNPAID, // 待付款
      shipStatus: ShipStatus.UNDELIVERED, // 待发货
    };

    // 使用分表服务创建订单
    const savedOrder = await this.orderShardingService.createOrder(orderBase);

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
    const { items } = await this.orderShardingService.findAll(1, 1000); // 默认获取前1000条
    return items;
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
    return await this.orderShardingService.findAll(page, limit);
  }

  /**
   * 根据会员ID获取订单列表
   * @param memberId 会员ID
   * @returns 订单列表
   */
  async findByMemberId(memberId: string): Promise<Order[]> {
    const { items } = await this.orderShardingService.findByMemberId(parseInt(memberId), 1, 1000);
    return items;
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
    const order = await this.orderShardingService.findByOrderSn(orderSn);

    if (!order) {
      throw new NotFoundException(`Order with SN ${orderSn} not found`);
    }

    if (order.orderStatus !== OrderStatus.UNPAID || order.payStatus !== PayStatus.UNPAID) {
      throw new BadRequestException('Order is not in unpaid status');
    }

    // 更新订单状态
    await this.orderShardingService.updateByOrderSn(orderSn, {
      orderStatus: OrderStatus.PAID,
      payStatus: PayStatus.PAID,
      payType,
      payTime: new Date(),
    });

    // 重新获取更新后的订单
    const updatedOrder = await this.orderShardingService.findByOrderSn(orderSn);

    if (!updatedOrder) {
      throw new NotFoundException(`Order with SN ${orderSn} not found after update`);
    }

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
    const order = await this.orderShardingService.findByOrderSn(orderSn);

    if (!order) {
      throw new NotFoundException(`Order with SN ${orderSn} not found`);
    }

    if (order.orderStatus !== OrderStatus.UNPAID || order.payStatus !== PayStatus.UNPAID) {
      throw new BadRequestException('Only unpaid orders can be canceled');
    }

    // 更新订单状态
    await this.orderShardingService.updateByOrderSn(orderSn, {
      orderStatus: OrderStatus.CANCELLED,
      payStatus: PayStatus.CANCEL,
      cancelTime: new Date(),
    });

    // 重新获取更新后的订单
    const updatedOrder = await this.orderShardingService.findByOrderSn(orderSn);

    if (!updatedOrder) {
      throw new NotFoundException(`Order with SN ${orderSn} not found after update`);
    }

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
    const order = await this.orderShardingService.findByOrderSn(orderSn);

    if (!order) {
      throw new NotFoundException(`Order with SN ${orderSn} not found`);
    }

    if (order.orderStatus !== OrderStatus.PAID || order.payStatus !== PayStatus.PAID || order.shipStatus !== ShipStatus.UNDELIVERED) {
      throw new BadRequestException('Order is not in paid and undelivered status');
    }

    // 更新订单状态
    await this.orderShardingService.updateByOrderSn(orderSn, {
      orderStatus: OrderStatus.DELIVERED,
      shipStatus: ShipStatus.DELIVERED,
      trackingNo,
      logisticsCompany,
      shipTime: new Date(),
    });

    // 重新获取更新后的订单
    const updatedOrder = await this.orderShardingService.findByOrderSn(orderSn);

    if (!updatedOrder) {
      throw new NotFoundException(`Order with SN ${orderSn} not found after update`);
    }

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
    const order = await this.orderShardingService.findByOrderSn(orderSn);

    if (!order) {
      throw new NotFoundException(`Order with SN ${orderSn} not found`);
    }

    if (order.orderStatus !== OrderStatus.DELIVERED || order.shipStatus !== ShipStatus.DELIVERED) {
      throw new BadRequestException('Order is not in delivered status');
    }

    // 更新订单状态
    await this.orderShardingService.updateByOrderSn(orderSn, {
      orderStatus: OrderStatus.COMPLETED,
      shipStatus: ShipStatus.RECEIVED,
      receiveTime: new Date(),
    });

    // 重新获取更新后的订单
    const updatedOrder = await this.orderShardingService.findByOrderSn(orderSn);

    if (!updatedOrder) {
      throw new NotFoundException(`Order with SN ${orderSn} not found after update`);
    }

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
   * 更新订单物流状态
   * @param orderId 订单ID
   * @param shippingStatus 物流状态
   */
  async updateShippingStatus(orderId: string, shippingStatus: number) {
    const order = await this.findOne(orderId);
    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    order.shipStatus = shippingStatus;
    await this.orderRepository.save(order);

    // 创建订单日志
    await this.createOrderLog(order.id, order.orderStatus, order.payStatus, shippingStatus, '物流状态更新');
  }

  /**
   * 根据订单编号获取订单
   * @param orderSn 订单编号
   * @returns 订单详情
   */
  async findByOrderSn(orderSn: string): Promise<Order> {
    const order = await this.orderShardingService.findByOrderSn(orderSn);
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
      where: { id: In(orderIds) },
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
