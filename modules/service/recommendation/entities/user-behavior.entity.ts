import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('user_behaviors')
export class UserBehavior {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: '用户ID' })
  @Index()
  userId: number;

  @Column({ type: 'varchar', length: 50, comment: '行为类型: view, click, purchase, cart, like' })
  behaviorType: string;

  @Column({ type: 'int', comment: '商品ID' })
  @Index()
  productId: number;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '商品分类' })
  category: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: '商品价格' })
  price: number;

  @Column({ type: 'json', nullable: true, comment: '行为上下文信息' })
  context: object;

  @Column({ type: 'decimal', precision: 5, scale: 3, default: 1.0, comment: '行为权重' })
  weight: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, comment: '行为发生时间' })
  behaviorTime: Date;
}