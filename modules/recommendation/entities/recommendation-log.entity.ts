import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('recommendation_logs')
@Index(['userId', 'createdAt'])
@Index(['status', 'createdAt'])
export class RecommendationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: '用户ID' })
  userId: number;

  @Column({ type: 'text', comment: '推荐商品列表' })
  recommendations: string;

  @Column({ 
    type: 'enum', 
    enum: ['success', 'failure', 'partial'],
    default: 'success',
    comment: '推荐状态'
  })
  status: string;

  @Column({ type: 'boolean', default: false, comment: '是否有点击' })
  clicked: boolean;

  @Column({ type: 'int', nullable: true, comment: '点击的商品ID' })
  clickedProductId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: '点击率' })
  clickRate: number;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '推荐场景' })
  scenario: string;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, comment: '点击时间' })
  clickedAt: Date;
}