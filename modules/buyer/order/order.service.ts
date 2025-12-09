import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from '../../../modules/common/order/entities/order.entity';
import { OrderItem } from '../../../modules/common/order/entities/order-item.entity';
import { OrderLog } from '../../../modules/common/order/entities/order-log.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus, PayStatus, ShipStatus } from '../../../modules/common/order/enum/order-status.enum';
import { CartService } from '../cart/cart.service';
import { ProductSku } from '../../../modules/common/product/entities/product-sku.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderLog) private readonly orderLogRepository: Repository<OrderLog>,
    @InjectRepository(ProductSku) private readonly skuRepository: Repository<ProductSku>,
    private readonly cartService: CartService,
  ) {}

  /**
   * 创建订单
   * @param userId 用户ID
   * @param createOrderDto 创建订单DTO
   * @returns 创建的订单
   */
  async createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    // 计算订单金额
    const totalAmount = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // 订单基本信息
    const order = this.orderRepository.create({
      orderSn: `ORD${Date.now()}`, // 生成订单号
      memberId: userId,
      storeId: 'default', // 默认店铺ID，需要从实际业务中获取
      totalAmount,
      payAmount: totalAmount, // 假设没有折扣
      freightAmount: 0, // 假设免运费
      discountAmount: 0,
      remark: createOrderDto.remark,
      orderStatus: OrderStatus.UNPAID, // 待付款
      payStatus: PayStatus.UNPAID, // 待付款
      shipStatus: ShipStatus.UNDELIVERED, // 待发货
      payType: createOrderDto.paymentMethod,
      consigneeName: 'Default Name', // 需要从地址信息中获取
      consigneeMobile: '13800138000', // 需要从地址信息中获取
      consigneeAddress: 'Default Address', // 需要从地址信息中获取
    });

    // 保存订单
    const savedOrder = await this.orderRepository.save(order);

    // 创建订单商品项
    const orderItems = createOrderDto.items.map((item) => 
      this.orderItemRepository.create({
        orderId: savedOrder.id,
        skuId: item.skuId,
        productId: item.skuId, // 这里需要从SKU中获取产品ID
        quantity: item.quantity,
        price: item.price,
        productName: item.skuName,
        productImage: '', // 需要从SKU中获取
        skuSpec: {}, // 需要从SKU中获取
        totalPrice: item.price * item.quantity,
      })
    );

    // 保存订单商品项
    await this.orderItemRepository.save(orderItems);

    // 创建订单日志
    await this.createOrderLog(savedOrder.id, OrderStatus.UNPAID, PayStatus.UNPAID, ShipStatus.UNDELIVERED, '订单创建成功');

    // 清空购物车中已购买的商品
    const cartIds = createOrderDto.items.map(item => item.skuId);
    await this.cartService.batchRemoveFromCart(userId, cartIds);

    return savedOrder;
  }

  /**
   * 获取订单列表
   * @param userId 用户ID
   * @param page 页码
   * @param limit 每页数量
   * @param status 订单状态
   * @returns 订单列表
   */
  async getOrderList(userId: string, page: number = 1, limit: number = 10, status?: string): Promise<{ items: Order[]; total: number }> {
    const query = this.orderRepository.createQueryBuilder('order')
      .where('order.userId = :userId', { userId })
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .orderBy('order.createdAt', 'DESC');

    // 添加状态过滤
    if (status) {
      query.andWhere('order.orderStatus = :status', { status });
    }

    // 执行分页查询
    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total };
  }

  /**
   * 获取订单详情
   * @param userId 用户ID
   * @param id 订单ID
   * @returns 订单详情
   */
  async getOrderDetail(userId: string, id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, memberId: userId },
      relations: ['orderItems', 'orderLogs'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  /**
   * 更新订单状态
   * @param userId 用户ID
   * @param id 订单ID
   * @param updateOrderStatusDto 更新订单状态DTO
   * @returns 更新后的订单
   */
  async updateOrderStatus(userId: string, id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.getOrderDetail(userId, id);

    // 检查状态是否可以更新
    this.checkOrderStatusTransition(order.orderStatus, updateOrderStatusDto.status);

    // 更新订单状态
    order.orderStatus = updateOrderStatusDto.status;
    await this.orderRepository.save(order);

    // 创建订单日志
    await this.createOrderLog(
      order.id, 
      order.orderStatus, 
      order.payStatus, 
      order.shipStatus, 
      updateOrderStatusDto.remark || '订单状态更新'
    );

    return order;
  }

  /**
   * 取消订单
   * @param userId 用户ID
   * @param id 订单ID
   * @returns 取消后的订单
   */
  async cancelOrder(userId: string, id: string): Promise<Order> {
    const order = await this.getOrderDetail(userId, id);

    // 检查订单是否可以取消
    if (order.orderStatus !== OrderStatus.UNPAID) {
      throw new BadRequestException('Only unpaid orders can be cancelled');
    }

    // 更新订单状态
    order.orderStatus = OrderStatus.CANCELLED;
    order.payStatus = PayStatus.CANCEL;
    await this.orderRepository.save(order);

    // 创建订单日志
    await this.createOrderLog(order.id, OrderStatus.CANCELLED, PayStatus.CANCEL, order.shipStatus, '订单 已取消');

    return order;
  }

  /**
   * 确认收货
   * @param userId 用户ID
   * @param id 订单ID
   * @returns 确认后的订单
   */
  async confirmReceipt(userId: string, id: string): Promise<Order> {
    const order = await this.getOrderDetail(userId, id);

    // 检查订单是否可以确认收货
    if (order.orderStatus !== OrderStatus.DELIVERED || order.shipStatus !== ShipStatus.DELIVERED) {
      throw new BadRequestException('Only shipped orders can be confirmed');
    }

    // 更新订单状态
    order.orderStatus = OrderStatus.COMPLETED;
    order.shipStatus = ShipStatus.RECEIVED;
    await this.orderRepository.save(order);

    // 创建订单日志
    await this.createOrderLog(order.id, OrderStatus.COMPLETED, order.payStatus, ShipStatus.RECEIVED, '订单已完成');

    return order;
  }

  /**
   * 获取订单日志
   * @param userId 用户ID
   * @param id 订单ID
   * @returns 订单日志列表
   */
  async getOrderLogs(userId: string, id: string): Promise<OrderLog[]> {
    const order = await this.getOrderDetail(userId, id);
    return await this.orderLogRepository.find({
      where: { orderId: id },
      order: { operateTime: 'DESC' },
    });
  }

  /**
   * 检查订单状态转换是否合法
   * @param currentStatus 当前状态
   * @param newStatus 新状态
   */
  private checkOrderStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    // 这里可以添加订单状态转换的逻辑检查
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.UNPAID]: [OrderStatus.PAID, OrderStatus.CANCELLED], // UNPAID -> PAID, CANCELLED
      [OrderStatus.PAID]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED], // PAID -> DELIVERED, CANCELLED
      [OrderStatus.UNDELIVERED]: [], // UNDELIVERED -> No transitions (not used in current flow)
      [OrderStatus.PARTS_DELIVERED]: [OrderStatus.DELIVERED], // PARTS_DELIVERED -> DELIVERED
      [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED], // DELIVERED -> COMPLETED
      [OrderStatus.COMPLETED]: [], // COMPLETED -> No transitions
      [OrderStatus.STAY_PICKED_UP]: [OrderStatus.TAKE], // STAY_PICKED_UP -> TAKE
      [OrderStatus.TAKE]: [OrderStatus.COMPLETED], // TAKE -> COMPLETED
      [OrderStatus.CANCELLED]: [], // CANCELLED -> No transitions
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(`Invalid order status transition from ${currentStatus} to ${newStatus}`);
    }
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
    orderStatus?: OrderStatus,
    payStatus?: PayStatus,
    shipStatus?: ShipStatus,
    remark?: string,
  ): Promise<OrderLog> {
    const log = this.orderLogRepository.create({
      orderId,
      orderStatus,
      payStatus,
      shipStatus,
      remark,
      operateTime: new Date(),
    });
    return await this.orderLogRepository.save(log);
  }
}
