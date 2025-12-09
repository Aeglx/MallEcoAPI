import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { orderShardingConfig } from './sharding.config';

// 订单分表迁移脚本
export class CreateOrderShardingTables1718850000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 获取原始订单表的结构
    const originalTable = await queryRunner.getTable('mall_order');
    if (!originalTable) {
      throw new Error('原始订单表 mall_order 不存在');
    }

    // 创建分表
    for (let i = 0; i < orderShardingConfig.tableCount; i++) {
      const tableName = `mall_order_${i.toString().padStart(2, '0')}`;
      
      // 检查分表是否已存在
      const exists = await queryRunner.hasTable(tableName);
      if (exists) {
        console.log(`分表 ${tableName} 已存在，跳过创建`);
        continue;
      }

      // 创建分表
      const table = new Table({
        name: tableName,
        columns: originalTable.columns.map(col => ({
          name: col.name,
          type: col.type,
          length: col.length,
          precision: col.precision,
          scale: col.scale,
          default: col.default,
          isNullable: col.isNullable,
          isPrimary: col.isPrimary,
          isUnique: col.isUnique,
          isGenerated: col.isGenerated,
          generationStrategy: col.generationStrategy,
          comment: col.comment,
          enum: col.enum,
          enumName: col.enumName,
        })),
        indices: originalTable.indices.map(idx => ({
          name: idx.name ? idx.name.replace('mall_order', tableName) : undefined,
          columnNames: idx.columnNames || [],
          isUnique: idx.isUnique,
          where: idx.where,
        })),
        foreignKeys: originalTable.foreignKeys.map(fk => ({
          name: fk.name ? fk.name.replace('mall_order', tableName) : undefined,
          columnNames: fk.columnNames,
          referencedColumnNames: fk.referencedColumnNames,
          referencedTableName: fk.referencedTableName,
          onDelete: fk.onDelete,
          onUpdate: fk.onUpdate,
        })),
        checks: originalTable.checks,
        uniques: originalTable.uniques,
      });

      await queryRunner.createTable(table, true);
      console.log(`分表 ${tableName} 创建成功`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除所有分表
    for (let i = 0; i < orderShardingConfig.tableCount; i++) {
      const tableName = `mall_order_${i.toString().padStart(2, '0')}`;
      const exists = await queryRunner.hasTable(tableName);
      
      if (exists) {
        await queryRunner.dropTable(tableName, true);
        console.log(`分表 ${tableName} 删除成功`);
      }
    }
  }
}
