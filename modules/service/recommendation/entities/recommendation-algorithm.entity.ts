import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('recommendation_algorithms')
export class RecommendationAlgorithm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '算法名称' })
  name: string;

  @Column({ type: 'varchar', length: 500, comment: '算法描述' })
  description: string;

  @Column({ type: 'text', nullable: true, comment: '算法配置参数' })
  config: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0, comment: '算法权重' })
  weight: number;

  @Column({ type: 'int', default: 1, comment: '优先级' })
  priority: number;

  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '算法效果评分' })
  performanceScore: number;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date;
}