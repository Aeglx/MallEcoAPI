import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('cache_config')
@Index(['cacheKey', 'isActive'])
export class CacheConfigEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, comment: '缓存键' })
  cacheKey: string;

  @Column({ type: 'varchar', length: 100, comment: '缓存类型' })
  cacheType: string;

  @Column({ type: 'int', comment: '过期时间(秒)' })
  ttl: number;

  @Column({ type: 'varchar', length: 20, comment: '缓存策略' })
  strategy: string;

  @Column({ type: 'text', nullable: true, comment: '缓存内容示例' })
  contentSample: string;

  @Column({ type: 'int', comment: '访问频率' })
  accessFrequency: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: '命中率(%)' })
  hitRate: number;

  @Column({ type: 'varchar', length: 50, comment: '数据大小' })
  dataSize: string;

  @Column({ type: 'boolean', comment: '是否启用' })
  isActive: boolean;

  @Column({ type: 'boolean', comment: '是否预热' })
  isWarmedUp: boolean;

  @Column({ type: 'text', nullable: true, comment: '依赖项' })
  dependencies: string;

  @Column({ type: 'text', nullable: true, comment: '失效条件' })
  invalidationConditions: string;

  @Column({ type: 'text', nullable: true, comment: '配置描述' })
  description: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @CreateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
