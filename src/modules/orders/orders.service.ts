import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  // 使用内存存储模拟数据库操作
  private orders: Order[] = [];
  private orderItems: OrderItem[] = [];

  /**
   * 生成订单编号
   */
  private generateOrderSn(): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000) % 10000;
    return `ORD${timestamp}${random.toString().padStart(4, '0')}`;
  }

  /**
   * 创建订单
   * @param dto 创建订单DTO
   * @returns 创建的订单
   */
  async createOrder(dto: CreateOrderDto): Promise<Order> {
    // 计算订单总金额
    const totalAmount = dto.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = dto.shippingFee || 0;
    const couponAmount = dto.couponAmount || 0;
    const payAmount = totalAmount + shippingFee - couponAmount;

    // 创建订单
    const order = new Order();
    order.id = Date.now().toString();
    order.orderSn = this.generateOrderSn();
    order.userId = dto.userId;
    order.totalAmount = totalAmount;
    order.payAmount = payAmount;
    order.couponAmount = couponAmount;
    order.shippingFee = shippingFee;
    order.payType = dto.payType;
    order.status = 0; // 待付款
    order.consignee = dto.consignee;
    order.mobile = dto.mobile;
    order.province = dto.province;
    order.city = dto.city;
    order.district = dto.district;
    order.address = dto.address;
    order.zipCode = dto.zipCode;
    order.userNote = dto.userNote;
    order.isDel = 0;
    order.createTime = new Date();
    order.updateTime = new Date();

    // 添加到内存存储
    this.orders.push(order);

    // 创建订单商品项
    for (const itemDto of dto.items) {
      const orderItem = new OrderItem();
      orderItem.id = Date.now().toString() + Math.floor(Math.random() * 1000);
      orderItem.orderId = order.id;
      orderItem.productId = itemDto.productId;
      orderItem.productName = itemDto.productName;
      orderItem.productImage = itemDto.productImage;
      orderItem.productSku = itemDto.productSku;
      orderItem.price = itemDto.price;
      orderItem.quantity = itemDto.quantity;
      orderItem.totalPrice = itemDto.price * itemDto.quantity;
      orderItem.isDel = 0;
      orderItem.createTime = new Date();
      orderItem.updateTime = new Date();

      // 添加到内存存储
      this.orderItems.push(orderItem);
    }

    return order;
  }

  /**
   * 获取订单详情
   * @param id 订单ID
   * @returns 订单详情
   */
  async getOrderById(id: string): Promise<Order> {
    const order = this.orders.find(o => o.id === id && o.isDel === 0);
    if (!order) {
      return null;
    }

    return order;
  }

  /**
   * 获取订单详情（包含订单商品）
   * @param id 订单ID
   * @returns 订单详情（包含订单商品）
   */
  async getOrderWithItemsById(id: string): Promise<{ order: Order; items: OrderItem[] }> {
    const order = await this.getOrderById(id);
    if (!order) {
      return null;
    }

    const items = this.orderItems.filter(item => item.orderId === id && item.isDel === 0);

    return { order, items };
  }

  /**
   * 获取用户订单列表
   * @param userId 用户ID
   * @param status 订单状态（可选）
   * @returns 订单列表
   */
  async getOrdersByUserId(userId: string, status?: number): Promise<Order[]> {
    let orders = this.orders.filter(o => o.userId === userId && o.isDel === 0);

    if (status !== undefined) {
      orders = orders.filter(o => o.status === status);
    }

    // 按创建时间倒序排序
    return orders.sort((a, b) => b.createTime.getTime() - a.createTime.getTime());
  }

  /**
   * 更新订单状态
   * @param id 订单ID
   * @param dto 更新订单状态DTO
   * @returns 更新后的订单
   */
  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = this.orders.find(o => o.id === id && o.isDel === 0);
    if (!order) {
      return null;
    }

    // 更新状态
    order.status = dto.status;

    // 更新时间
    order.updateTime = new Date();

    // 根据状态更新相关时间
    if (dto.status === 1 && !order.shippingTime) {
      // 待发货 -> 更新发货时间
      order.shippingTime = new Date();
    } else if (dto.status === 2 && !order.confirmTime) {
      // 待收货 -> 更新确认收货时间
      order.confirmTime = new Date();
    } else if (dto.status === 4 && !order.endTime) {
      // 已完成 -> 更新订单结束时间
      order.endTime = new Date();
    } else if (dto.status === 5 && !order.endTime) {
      // 已取消 -> 更新订单结束时间
      order.endTime = new Date();
    }

    // 更新管理员备注
    if (dto.adminNote) {
      order.adminNote = dto.adminNote;
    }

    return order;
  }

  /**
   * 删除订单（逻辑删除）
   * @param id 订单ID
   * @returns 是否删除成功
   */
  async deleteOrder(id: string): Promise<boolean> {
    const order = this.orders.find(o => o.id === id && o.isDel === 0);
    if (!order) {
      return false;
    }

    // 逻辑删除
    order.isDeleted = 1;
    order.updateTime = new Date();

    // 同时删除订单商品
    for (const item of this.orderItems) {
      if (item.orderId === id && item.isDel === 0) {
        item.isDel = 1;
        item.updateTime = new Date();
      }
    }

    return true;
  }
}
