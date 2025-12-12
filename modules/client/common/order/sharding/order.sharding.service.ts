import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Order } from '../entities/order.entity';
import { generateOrderSn } from '../utils/order.sn.generator';
import { ShardingService } from '../../sharding/sharding.service';
import { ShardingTransactionManager } from '../../sharding/sharding.transaction.manager';
import { orderShardingConfig } from './sharding.config';

@Injectable()
export class OrderShardingService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly shardingService: ShardingService,
    private readonly transactionManager: ShardingTransactionManager,
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
    
    // 使用事务保存到对应分表
    return await this.transactionManager.executeInTransaction(async (queryRunner) => {
      return await this.shardingService.saveToShardingTable(
        queryRunner,
        order,
        'mall_order',
        orderSn,
        orderShardingConfig,
        'order_sn'
      );
    });
  }

  /**
   * 根据订单号查询订单
   */
  async findByOrderSn(orderSn: string): Promise<Order | undefined> {
    return await this.shardingService.findByShardingValue(
      Order,
      orderSn,
      'mall_order',
      orderShardingConfig,
      'order_sn'
    );
  }

  /**
   * 根据订单号更新订单
   */
  async updateByOrderSn(orderSn: string, updateData: Partial<Order>): Promise<void> {
    // 使用事务更新订单
    await this.transactionManager.executeInTransaction(async (queryRunner) => {
      await this.shardingService.updateByShardingValue(
        queryRunner,
        Order,
        orderSn,
        updateData,
        'mall_order',
        orderShardingConfig,
        'order_sn'
      );
    });
  }

  /**
   * 根据订单号删除订单
   */
  async deleteByOrderSn(orderSn: string): Promise<void> {
    // 使用事务删除订单
    await this.transactionManager.executeInTransaction(async (queryRunner) => {
      await this.shardingService.deleteByShardingValue(
        queryRunner,
        Order,
        orderSn,
        'mall_order',
        orderShardingConfig,
        'order_sn'
      );
    });
  }

  /**
   * 批量查询订单
   */
  async findInBatches(orderSns: string[]): Promise<Order[]> {
    return await this.shardingService.findInBatches(
      this.dataSource.manager,
      Order,
      'order',
      'mall_order',
      orderShardingConfig,
      'orderSn',
      orderSns
    );
  }

  /**
   * 获取订单总数
   */
  async getTotalCount(): Promise<number> {
    return await this.shardingService.getTotalCount(
      this.dataSource.manager,
      Order,
      'order',
      'mall_order',
      orderShardingConfig
    );
  }

  /**
   * 分页查询所有订单（跨表）
   */
  async findAll(page: number = 1, limit: number = 10): Promise<{ items: Order[]; total: number }> {
    return await this.shardingService.findWithPagination(
      this.dataSource.manager,
      Order,
      'order',
      'mall_order',
      orderShardingConfig,
      page,
      limit
    );
  }

  /**
   * 根据用户ID查询订单（跨表）
   */
  async findByMemberId(memberId: number, page: number = 1, limit: number = 10): Promise<{ items: Order[]; total: number }> {
    // 使用where条件进行分页查询
    return await this.shardingService.findWithPagination(
      this.dataSource.manager,
      Order,
      'order',
      'mall_order',
      orderShardingConfig,
      page,
      limit,
      { memberId }
    );
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
