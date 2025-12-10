import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('database_query')
@Index(['queryDate', 'executionTime'])
export class DatabaseQueryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '查询标识' })
  queryId: string;

  @Column({ type: 'text', comment: 'SQL语句' })
  sqlStatement: string;

  @Column({ type: 'varchar', length: 100, comment: '查询类型' })
  queryType: string;

  @Column({ type: 'varchar', length: 100, comment: '表名' })
  tableName: string;

  @Column({ type: 'int', comment: '执行次数' })
  executionCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '平均执行时间(ms)' })
  avgExecutionTime: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '最大执行时间(ms)' })
  maxExecutionTime: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '最小执行时间(ms)' })
  minExecutionTime: number;

  @Column({ type: 'bigint', comment: '扫描行数' })
  scannedRows: number;

  @Column({ type: 'bigint', comment: '返回行数' })
  returnedRows: number;

  @Column({ type: 'varchar', length: 20, comment: '性能等级' })
  performanceLevel: string;

  @Column({ type: 'text', nullable: true, comment: '优化建议' })
  optimizationSuggestion: string;

  @Column({ type: 'date', comment: '查询日期' })
  queryDate: Date;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}