import { EntityRepository, Repository, EntityManager, SelectQueryBuilder } from 'typeorm';
import { Order } from '../entities/order.entity';
import { orderShardingConfig, getTableIndex, getTableName } from './sharding.config';

@EntityRepository(Order)
export class OrderShardingRepository extends Repository<Order> {
  /**
   * 根据订单号获取分表名称
   */
  getTableNameByOrderSn(orderSn: string): string {
    const tableIndex = getTableIndex(orderSn, orderShardingConfig.tableCount);
    return getTableName('mall_order', tableIndex);
  }

  /**
   * 根据订单号创建查询构建器
   */
  createQueryBuilderByOrderSn(orderSn: string, alias = 'order'): SelectQueryBuilder<Order> {
    const tableName = this.getTableNameByOrderSn(orderSn);
    return this.manager.createQueryBuilder(Order, alias).from(tableName, alias);
  }

  /**
   * 根据订单号查找订单
   */
  async findByOrderSn(orderSn: string): Promise<Order | undefined> {
    return await this.createQueryBuilderByOrderSn(orderSn)
      .where('order.order_sn = :orderSn', { orderSn })
      .getOne();
  }

  /**
   * 根据订单号更新订单
   */
  async updateByOrderSn(orderSn: string, updateData: Partial<Order>): Promise<void> {
    const qb = this.createQueryBuilderByOrderSn(orderSn);
    
    // 构建更新字段
    const updateFields = Object.keys(updateData).map(key => `${qb.alias}.${key} = :${key}`).join(', ');
    
    await qb
      .update()
      .set(updateData)
      .where('order.order_sn = :orderSn', { orderSn })
      .execute();
  }

  /**
   * 根据订单号删除订单
   */
  async deleteByOrderSn(orderSn: string): Promise<void> {
    await this.createQueryBuilderByOrderSn(orderSn)
      .delete()
      .where('order.order_sn = :orderSn', { orderSn })
      .execute();
  }

  /**
   * 保存订单到指定分表
   */
  async saveToShardingTable(order: Order): Promise<Order> {
    const tableName = this.getTableNameByOrderSn(order.orderSn);
    
    // 使用原生SQL插入
      const insertResult = await this.manager
        .createQueryBuilder()
        .insert()
        .into(tableName)
        .values(order)
        .execute();
    
    // 设置返回的ID
    order.id = insertResult.identifiers[0].id;
    return order;
  }

  /**
   * 批量查询不同分表的订单
   */
  async findInBatches(orderSns: string[]): Promise<Order[]> {
    // 将订单号按分表分组
    const orderSnGroups: Map<string, string[]> = new Map();
    
    for (const orderSn of orderSns) {
      const tableName = this.getTableNameByOrderSn(orderSn);
      if (!orderSnGroups.has(tableName)) {
        orderSnGroups.set(tableName, []);
      }
      orderSnGroups.get(tableName)!.push(orderSn);
    }

    // 并行查询所有分表
    const promises = Array.from(orderSnGroups.entries()).map(async ([tableName, sns]) => {
      const qb = this.manager.createQueryBuilder(Order, 'order').from(tableName, 'order');
      return await qb.where('order.order_sn IN (:...orderSns)', { orderSns: sns }).getMany() as Order[];
    });

    // 合并结果
    const results = await Promise.all(promises);
    return results.flat();
  }

  /**
   * 获取所有分表的订单数量
   */
  async getTotalCount(): Promise<number> {
    let total = 0;
    
    for (let i = 0; i < orderShardingConfig.tableCount; i++) {
      const tableName = getTableName('mall_order', i);
      const qb = this.manager.createQueryBuilder(Order, 'order').from(tableName, 'order');
      const count = await qb.select('COUNT(*)', 'count').getRawOne<{ count: string }>();
      total += parseInt(count.count, 10);
    }
    
    return total;
  }

  /**
   * 跨表分页查询
   */
  async findWithPagination(page: number, limit: number): Promise<{ items: Order[]; total: number }> {
    const total = await this.getTotalCount();
    const items: Order[] = [];
    
    // 计算需要查询的表范围
    let remainingLimit = limit;
    let offset = (page - 1) * limit;
    
    for (let i = 0; i < orderShardingConfig.tableCount && remainingLimit > 0; i++) {
      const tableName = getTableName('mall_order', i);
      const qb = this.manager.createQueryBuilder(Order, 'order').from(tableName, 'order');
      
      // 获取当前表的记录数
      const countResult = await qb.select('COUNT(*)', 'count').getRawOne<{ count: string }>();
      const tableCount = parseInt(countResult.count, 10);
      
      // 如果当前表的记录数小于偏移量，跳过
      if (tableCount <= offset) {
        offset -= tableCount;
        continue;
      }
      
      // 计算当前表需要查询的数量
      const take = Math.min(tableCount - offset, remainingLimit);
      
      // 查询当前表
      const tableItems = await qb
        .select()
        .skip(offset)
        .take(take)
        .orderBy('order.create_time', 'DESC')
        .getMany() as Order[];
      
      items.push(...tableItems);
      remainingLimit -= take;
      offset = 0; // 后续表的偏移量重置为0
    }
    
    return { items, total };
  }

  /**
   * 根据用户ID查询订单（需要跨表查询）
   */
  async findByMemberId(memberId: number, page: number = 1, limit: number = 10): Promise<{ items: Order[]; total: number }> {
    let total = 0;
    const items: Order[] = [];
    let remainingLimit = limit;
    let offset = (page - 1) * limit;
    
    for (let i = 0; i < orderShardingConfig.tableCount; i++) {
      const tableName = getTableName('mall_order', i);
      const qb = this.manager.createQueryBuilder(Order, 'order').from(tableName, 'order');
      
      // 获取当前表符合条件的记录数
      const countQuery = qb.clone();
      const countResult = await countQuery
        .select('COUNT(*)', 'count')
        .where('order.member_id = :memberId', { memberId })
        .getRawOne<{ count: string }>();
      
      const tableCount = parseInt(countResult.count, 10);
      total += tableCount;
      
      // 如果当前表的记录数小于偏移量，跳过
      if (tableCount <= offset) {
        offset -= tableCount;
        continue;
      }
      
      // 计算当前表需要查询的数量
      const take = Math.min(tableCount - offset, remainingLimit);
      
      // 查询当前表
      const tableItems = await qb
        .select()
        .where('order.member_id = :memberId', { memberId })
        .skip(offset)
        .take(take)
        .orderBy('order.create_time', 'DESC')
        .getMany() as Order[];
      
      items.push(...tableItems);
      remainingLimit -= take;
      offset = 0; // 后续表的偏移量重置为0
      
      if (remainingLimit <= 0) break;
    }
    
    return { items, total };
  }
}
