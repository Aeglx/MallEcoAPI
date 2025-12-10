import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('database_performance')
@Index(['metricDate', 'metricType'])
export class DatabasePerformanceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, comment: '指标类型' })
  metricType: string;

  @Column({ type: 'varchar', length: 100, comment: '指标名称' })
  metricName: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, comment: '指标值' })
  metricValue: number;

  @Column({ type: 'varchar', length: 50, comment: '单位' })
  unit: string;

  @Column({ type: 'date', comment: '指标日期' })
  metricDate: Date;

  @Column({ type: 'varchar', length: 100, comment: '数据库实例' })
  databaseInstance: string;

  @Column({ type: 'text', nullable: true, comment: '详细信息' })
  details: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}