import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * 创建订单分表结构的迁移
 */
export class CreateOrderShardingTables1718850000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 从原始订单表获取结构信息
    const originalTable = await queryRunner.getTable('mall_order');
    if (!originalTable) {
      throw new Error('Original table mall_order not found');
    }

    // 创建16个分表
    for (let i = 0; i < 16; i++) {
      const tableIndex = i.toString().padStart(2, '0');
      const tableName = `mall_order_${tableIndex}`;

      // 复制原始表结构创建分表
      await queryRunner.createTable(
        new Table({
          name: tableName,
          columns: originalTable.columns,
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
        }),
        true, // ifNotExists
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除所有分表
    for (let i = 0; i < 16; i++) {
      const tableIndex = i.toString().padStart(2, '0');
      const tableName = `mall_order_${tableIndex}`;
      await queryRunner.dropTable(tableName, true); // ifExists
    }
  }
}
