import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('cache_performance')
@Index(['metricDate', 'cacheType'])
export class CachePerformanceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, comment: '缓存类型' })
  cacheType: string;

  @Column({ type: 'varchar', length: 100, comment: '缓存实例' })
  cacheInstance: string;

  @Column({ type: 'varchar', length: 50, comment: '指标名称' })
  metricName: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, comment: '指标值' })
  metricValue: number;

  @Column({ type: 'varchar', length: 20, comment: '单位' })
  unit: string;

  @Column({ type: 'date', comment: '指标日期' })
  metricDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: '命中率(%)' })
  hitRate: number;

  @Column({ type: 'bigint', comment: '总请求数' })
  totalRequests: number;

  @Column({ type: 'bigint', comment: '命中次数' })
  hits: number;

  @Column({ type: 'bigint', comment: '未命中次数' })
  misses: number;

  @Column({ type: 'int', comment: '内存使用量(MB)' })
  memoryUsage: number;

  @Column({ type: 'int', comment: '最大内存限制(MB)' })
  memoryLimit: number;

  @Column({ type: 'text', nullable: true, comment: '详细信息' })
  details: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}