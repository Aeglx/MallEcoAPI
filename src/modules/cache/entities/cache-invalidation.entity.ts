import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('cache_invalidation')
@Index(['invalidationDate', 'cacheType'])
export class CacheInvalidationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, comment: '缓存键模式' })
  keyPattern: string;

  @Column({ type: 'varchar', length: 100, comment: '缓存类型' })
  cacheType: string;

  @Column({ type: 'varchar', length: 50, comment: '失效类型' })
  invalidationType: string;

  @Column({ type: 'text', comment: '失效原因' })
  reason: string;

  @Column({ type: 'int', comment: '失效键数量' })
  keysCount: number;

  @Column({ type: 'int', comment: '执行时间(毫秒)' })
  executionTime: number;

  @Column({ type: 'varchar', length: 50, comment: '触发源' })
  triggerSource: string;

  @Column({ type: 'text', nullable: true, comment: '相关数据ID' })
  relatedDataIds: string;

  @Column({ type: 'boolean', comment: '是否批量操作' })
  isBatch: boolean;

  @Column({ type: 'text', nullable: true, comment: '影响范围' })
  affectedScope: string;

  @Column({ type: 'text', nullable: true, comment: '备注信息' })
  notes: string;

  @Column({ type: 'date', comment: '失效日期' })
  invalidationDate: Date;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}