import { Injectable, Type } from '@nestjs/common';
import { DataSource, QueryRunner, EntityManager } from 'typeorm';
import { ShardingConfig } from './sharding.config';

@Injectable()
export class ShardingTransactionManager {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * 开始事务
   */
  async startTransaction(): Promise<QueryRunner> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }

  /**
   * 提交事务
   */
  async commitTransaction(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.commitTransaction();
  }

  /**
   * 回滚事务
   */
  async rollbackTransaction(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.rollbackTransaction();
  }

  /**
   * 释放资源
   */
  async release(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.release();
  }

  /**
   * 在事务中执行操作
   */
  async executeInTransaction<T>(
    callback: (queryRunner: QueryRunner) => Promise<T>
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await callback(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 在事务中保存实体到指定分表
   */
  async saveToShardingTable<T>(
    queryRunner: QueryRunner,
    entity: T,
    baseTableName: string,
    shardingValue: string,
    shardingConfig: ShardingConfig,
    shardingColumn: string
  ): Promise<T> {
    // 计算分表名称
    const tableIndex = this.getTableIndex(shardingValue, shardingConfig.tableCount);
    const tableName = `${baseTableName}_${tableIndex.toString().padStart(2, '0')}`;

    // 使用原生SQL插入
    const insertResult = await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(tableName)
      .values(entity)
      .execute();

    // 设置返回的ID
    if (insertResult.identifiers[0]?.id) {
      (entity as any).id = insertResult.identifiers[0].id;
    }

    return entity;
  }

  /**
   * 在事务中更新指定分表的实体
   */
  async updateByShardingValue<T>(
    queryRunner: QueryRunner,
    entityClass: Type<T>,
    shardingValue: string,
    updateData: Partial<T>,
    baseTableName: string,
    shardingConfig: ShardingConfig,
    shardingColumn: string
  ): Promise<void> {
    // 计算分表名称
    const tableIndex = this.getTableIndex(shardingValue, shardingConfig.tableCount);
    const tableName = `${baseTableName}_${tableIndex.toString().padStart(2, '0')}`;

    // 创建查询构建器
    const qb = queryRunner.manager.createQueryBuilder(entityClass, 'entity').from(tableName, 'entity');

    // 执行更新
    await qb
      .update()
      .set(updateData)
      .where(`entity.${shardingColumn} = :shardingValue`, { shardingValue })
      .execute();
  }

  /**
   * 在事务中删除指定分表的实体
   */
  async deleteByShardingValue<T>(
    queryRunner: QueryRunner,
    entityClass: Type<T>,
    shardingValue: string,
    baseTableName: string,
    shardingConfig: ShardingConfig,
    shardingColumn: string
  ): Promise<void> {
    // 计算分表名称
    const tableIndex = this.getTableIndex(shardingValue, shardingConfig.tableCount);
    const tableName = `${baseTableName}_${tableIndex.toString().padStart(2, '0')}`;

    // 创建查询构建器
    const qb = queryRunner.manager.createQueryBuilder(entityClass, 'entity').from(tableName, 'entity');

    // 执行删除
    await qb
      .delete()
      .where(`entity.${shardingColumn} = :shardingValue`, { shardingValue })
      .execute();
  }

  /**
   * 计算分表索引
   */
  private getTableIndex(shardingValue: string, tableCount: number): number {
    if (!shardingValue) {
      throw new Error('分表字段值不能为空');
    }
    
    // 简单的哈希算法
    let hash = 0;
    for (let i = 0; i < shardingValue.length; i++) {
      const char = shardingValue.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // 取绝对值并取模
    return Math.abs(hash) % tableCount;
  }
}
