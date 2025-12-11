import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('recommendations')
export class Recommendation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, comment: '推荐类型: user_based, item_based, content_based, hybrid' })
  type: string;

  @Column({ type: 'int', nullable: true, comment: '用户ID' })
  @Index()
  userId: number;

  @Column({ type: 'int', comment: '商品ID' })
  @Index()
  productId: number;

  @Column({ type: 'decimal', precision: 5, scale: 3, comment: '推荐分数' })
  score: number;

  @Column({ type: 'json', nullable: true, comment: '推荐算法参数' })
  algorithmParams: object;

  @Column({ type: 'varchar', length: 20, default: 'active', comment: '状态: active, inactive' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}