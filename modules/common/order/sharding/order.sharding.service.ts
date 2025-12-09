import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../entities/order.entity';
import { OrderShardingRepository } from './order.sharding.repository';
import { generateOrderSn } from '../utils/order.sn.generator';

@Injectable()
export class OrderShardingService {
  constructor(
    @InjectRepository(OrderShardingRepository)
    private readonly orderShardingRepository: OrderShardingRepository,
  ) {}

  /**
   * 创建订单（自动分表）
   */
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    // 生成订单号
    const orderSn = generateOrderSn();
    
    // 创建订单实体
    const order = new Order();
    Object.assign(order, orderData, { orderSn });
    
    // 保存到对应分表
    return await this.orderShardingRepository.saveToShardingTable(order);
  }

  /**
   * 根据订单号查询订单
   */
  async findByOrderSn(orderSn: string): Promise<Order | undefined> {
    return await this.orderShardingRepository.findByOrderSn(orderSn);
  }

  /**
   * 根据订单号更新订单
   */
  async updateByOrderSn(orderSn: string, updateData: Partial<Order>): Promise<void> {
    return await this.orderShardingRepository.updateByOrderSn(orderSn, updateData);
  }

  /**
   * 根据订单号删除订单
   */
  async deleteByOrderSn(orderSn: string): Promise<void> {
    return await this.orderShardingRepository.deleteByOrderSn(orderSn);
  }

  /**
   * 批量查询订单
   */
  async findInBatches(orderSns: string[]): Promise<Order[]> {
    return await this.orderShardingRepository.findInBatches(orderSns);
  }

  /**
   * 获取订单总数
   */
  async getTotalCount(): Promise<number> {
    return await this.orderShardingRepository.getTotalCount();
  }

  /**
   * 分页查询所有订单（跨表）
   */
  async findAll(page: number = 1, limit: number = 10): Promise<{ items: Order[]; total: number }> {
    return await this.orderShardingRepository.findWithPagination(page, limit);
  }

  /**
   * 根据用户ID查询订单（跨表）
   */
  async findByMemberId(memberId: number, page: number = 1, limit: number = 10): Promise<{ items: Order[]; total: number }> {
    return await this.orderShardingRepository.findByMemberId(memberId, page, limit);
  }

  /**
   * 支付订单（更新订单状态）
   */
  async payOrder(orderSn: string, transactionId: string): Promise<void> {
    return await this.updateByOrderSn(orderSn, {
      orderStatus: 1, // 已支付
      payStatus: 1, // 已支付
      payTime: new Date(),
    });
  }

  /**
   * 取消订单
   */
  async cancelOrder(orderSn: string, reason: string): Promise<void> {
    return await this.updateByOrderSn(orderSn, {
      orderStatus: 2, // 已取消
      cancelTime: new Date(),
    });
  }
}
