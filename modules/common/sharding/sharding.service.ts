import { Injectable, Type } from '@nestjs/common';
import { EntityManager, DataSource, SelectQueryBuilder, QueryRunner } from 'typeorm';
import { ShardingConfig, getTableIndex, getTableName } from './sharding.config';

@Injectable()
export class ShardingService {
  constructor(private readonly dataSource: DataSource) {}
  /**
   * 获取分表名称
   */
  getTableName<T>(
    baseTableName: string,
    shardingValue: string,
    shardingConfig: ShardingConfig
  ): string {
    const tableIndex = getTableIndex(shardingValue, shardingConfig.tableCount);
    return getTableName(baseTableName, tableIndex);
  }

  /**
   * 根据分表字段值查询实体
   */
  async findByShardingValue<T>(
    entityClass: Type<T>,
    shardingValue: string,
    baseTableName: string,
    shardingConfig: ShardingConfig,
    shardingColumn: string
  ): Promise<T | undefined> {
    const entityManager = this.dataSource.manager;
    const tableName = this.getTableName(baseTableName, shardingValue, shardingConfig);
    return await entityManager.createQueryBuilder(entityClass, 'entity')
      .from(`${tableName}`, 'entity')
      .where(`entity.${shardingColumn} = :shardingValue`, { shardingValue })
      .getOne() as T | undefined;
  }

  /**
   * 保存实体到对应的分表
   */
  async saveToShardingTable<T>(
    queryRunner: QueryRunner | null,
    entity: T,
    baseTableName: string,
    shardingValue: string,
    shardingConfig: ShardingConfig,
    shardingColumn: string
  ): Promise<T> {
    const entityManager = queryRunner ? queryRunner.manager : this.dataSource.manager;
    const tableName = this.getTableName(baseTableName, shardingValue, shardingConfig);
    
    // 使用原生SQL插入，因为TypeORM的save()方法会根据实体元数据选择表名
    const metadata = this.dataSource.getMetadata(entity.constructor as any);
    const columns = metadata.columns.map(col => col.propertyName);
    const values = columns.map(col => (entity as any)[col]);
    
    // 使用PostgreSQL风格的占位符
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    
    const result = await entityManager.query(query, values);
    return result[0] as T;
  }

  /**
   * 根据分表字段值更新实体
   */
  async updateByShardingValue<T>(
    queryRunner: QueryRunner | null,
    entityClass: Type<T>,
    shardingValue: string,
    updateData: Partial<T>,
    baseTableName: string,
    shardingConfig: ShardingConfig,
    shardingColumn: string
  ): Promise<void> {
    const entityManager = queryRunner ? queryRunner.manager : this.dataSource.manager;
    const tableName = this.getTableName(baseTableName, shardingValue, shardingConfig);
    
    // TypeORM 的 UpdateQueryBuilder 不支持 from() 方法，需要直接指定表名
    await entityManager.createQueryBuilder()
      .update(tableName)
      .set(updateData as any)
      .where(`${shardingColumn} = :shardingValue`, { shardingValue })
      .execute();
  }

  /**
   * 根据分表字段值删除实体
   */
  async deleteByShardingValue<T>(
    queryRunner: QueryRunner | null,
    entityClass: Type<T>,
    shardingValue: string,
    baseTableName: string,
    shardingConfig: ShardingConfig,
    shardingColumn: string
  ): Promise<void> {
    const entityManager = queryRunner ? queryRunner.manager : this.dataSource.manager;
    const tableName = this.getTableName(baseTableName, shardingValue, shardingConfig);
    
    // TypeORM 的 DeleteQueryBuilder 不支持 from() 方法，需要直接指定表名
    await entityManager.createQueryBuilder()
      .delete()
      .from(tableName)
      .where(`${shardingColumn} = :shardingValue`, { shardingValue })
      .execute();
  }

  /**
   * 创建针对特定分片表的查询构建器
   */
  createQueryBuilderByShardingValue<T>(
    entityManager: EntityManager | QueryRunner['manager'],
    entityClass: Type<T>,
    alias: string,
    baseTableName: string,
    shardingValue: string,
    shardingConfig: ShardingConfig
  ): SelectQueryBuilder<T> {
    const tableName = this.getTableName(baseTableName, shardingValue, shardingConfig);
    return entityManager.createQueryBuilder(entityClass, alias).from(tableName, alias);
  }

  /**
   * 跨表分页查询
   */
  async findWithPagination<T>(
    entityManager: EntityManager | QueryRunner['manager'],
    entityClass: Type<T>,
    alias: string,
    baseTableName: string,
    shardingConfig: ShardingConfig,
    page: number,
    limit: number,
    where?: any,
    order?: any
  ): Promise<{ items: T[]; total: number }> {
    // 计算总数
    const total = await this.getTotalCount(
      entityManager,
      entityClass,
      alias,
      baseTableName,
      shardingConfig,
      where
    );

    const items: T[] = [];
    let remainingLimit = limit;
    let offset = (page - 1) * limit;

    // 遍历所有分表
    for (let i = 0; i < shardingConfig.tableCount && remainingLimit > 0; i++) {
      const tableName = getTableName(baseTableName, i);
      const qb = entityManager.createQueryBuilder(entityClass, alias).from(tableName, alias);

      // 应用条件
      if (where) {
        this.applyWhereConditions(qb, where);
      }

      // 获取当前表的记录数
      const countResult = await qb.clone().select('COUNT(*)', 'count').getRawOne<{ count: string }>();
      const tableCount = parseInt(countResult.count, 10);

      // 如果当前表的记录数小于偏移量，跳过
      if (tableCount <= offset) {
        offset -= tableCount;
        continue;
      }

      // 计算当前表需要查询的数量
      const take = Math.min(tableCount - offset, remainingLimit);

      // 查询当前表
      const tableQuery = qb.clone().skip(offset).take(take);

      // 应用排序
      if (order) {
        this.applyOrderConditions(tableQuery, order);
      }

      const tableItems = await tableQuery.getMany() as T[];
      items.push(...tableItems);

      remainingLimit -= take;
      offset = 0; // 后续表的偏移量重置为0
    }

    return { items, total };
  }

  /**
   * 根据条件获取所有分表的总记录数
   */
  async getTotalCount<T>(
    entityManager: EntityManager | QueryRunner['manager'],
    entityClass: Type<T>,
    alias: string,
    baseTableName: string,
    shardingConfig: ShardingConfig,
    where?: any
  ): Promise<number> {
    let total = 0;

    // 遍历所有分表计算总数
    for (let i = 0; i < shardingConfig.tableCount; i++) {
      const tableName = getTableName(baseTableName, i);
      const qb = entityManager.createQueryBuilder(entityClass, alias).from(tableName, alias);

      // 应用条件
      if (where) {
        this.applyWhereConditions(qb, where);
      }

      const countResult = await qb.select('COUNT(*)', 'count').getRawOne<{ count: string }>();
      total += parseInt(countResult.count, 10);
    }

    return total;
  }

  /**
   * 根据条件跨表查询所有记录
   */
  async findAll<T>(
    entityManager: EntityManager | QueryRunner['manager'],
    entityClass: Type<T>,
    alias: string,
    baseTableName: string,
    shardingConfig: ShardingConfig,
    where?: any,
    order?: any
  ): Promise<T[]> {
    const items: T[] = [];

    // 遍历所有分表查询
    for (let i = 0; i < shardingConfig.tableCount; i++) {
      const tableName = getTableName(baseTableName, i);
      const qb = entityManager.createQueryBuilder(entityClass, alias).from(tableName, alias);

      // 应用条件
      if (where) {
        this.applyWhereConditions(qb, where);
      }

      // 应用排序
      if (order) {
        this.applyOrderConditions(qb, order);
      }

      const tableItems = await qb.getMany() as T[];
      items.push(...tableItems);
    }

    return items;
  }

  /**
   * 批量跨表查询
   */
  async findInBatches<T>(
    entityManager: EntityManager | QueryRunner['manager'],
    entityClass: Type<T>,
    alias: string,
    baseTableName: string,
    shardingConfig: ShardingConfig,
    shardingColumn: string,
    values: any[]
  ): Promise<T[]> {
    // 将值按分表分组
    const valueGroups: Map<string, any[]> = new Map();
    
    for (const value of values) {
      const tableName = this.getTableName(baseTableName, value, shardingConfig);
      if (!valueGroups.has(tableName)) {
        valueGroups.set(tableName, []);
      }
      valueGroups.get(tableName)!.push(value);
    }

    // 并行查询所有分表
    const promises = Array.from(valueGroups.entries()).map(async ([tableName, groupValues]) => {
      const qb = entityManager.createQueryBuilder(entityClass, alias).from(tableName, alias);
      return await qb.where(`${alias}.${shardingColumn} IN (:...values)`, { values: groupValues }).getMany() as T[];
    });

    // 合并结果
    const results = await Promise.all(promises);
    return results.flat();
  }

  /**
   * 应用查询条件
   */
  private applyWhereConditions<T>(qb: SelectQueryBuilder<T>, where: any): void {
    if (where) {
      Object.keys(where).forEach(key => {
        qb.andWhere(`${qb.alias}.${key} = :${key}`, { [key]: where[key] });
      });
    }
  }

  /**
   * 应用排序条件
   */
  private applyOrderConditions<T>(qb: SelectQueryBuilder<T>, order: any): void {
    if (order) {
      Object.keys(order).forEach(key => {
        qb.addOrderBy(`${qb.alias}.${key}`, order[key] as 'ASC' | 'DESC');
      });
    }
  }
}
