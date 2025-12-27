import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('promotion')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  promotionName: string;

  @Column({ length: 50 })
  promotionType: string; // COUPON, DISCOUNT, GROUP_BUY, SECKILL

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  discountRate: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  discountAmount: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minAmount: number;

  @Column('int', { nullable: true })
  usageLimit: number;

  @Column('int', { default: 0 })
  usedCount: number;

  @Column('simple-array', { nullable: true })
  goodsIds: string[];

  @Column('simple-array', { nullable: true })
  categoryIds: string[];

  @Column({ default: true })
  status: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @Column({ default: false })
  deleted: boolean;
}
