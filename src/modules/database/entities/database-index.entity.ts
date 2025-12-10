import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('database_index')
@Index(['tableName', 'indexName'])
export class DatabaseIndexEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '表名' })
  tableName: string;

  @Column({ type: 'varchar', length: 100, comment: '索引名' })
  indexName: string;

  @Column({ type: 'text', comment: '索引列' })
  indexColumns: string;

  @Column({ type: 'varchar', length: 20, comment: '索引类型' })
  indexType: string;

  @Column({ type: 'int', comment: '索引大小(MB)' })
  size: number;

  @Column({ type: 'int', comment: '使用次数' })
  usageCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: '使用率(%)' })
  usageRate: number;

  @Column({ type: 'varchar', length: 20, comment: '状态' })
  status: string;

  @Column({ type: 'text', nullable: true, comment: '优化建议' })
  optimizationSuggestion: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @CreateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}