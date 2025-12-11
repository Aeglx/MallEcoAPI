import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { CouponEntity } from './coupon.entity';

@Entity('coupon_users')
export class CouponUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', comment: '用户ID' })
  userId: string;

  @Column({ name: 'coupon_id', comment: '优惠券ID' })
  couponId: string;

  @Column({
    type: 'enum',
    enum: ['unused', 'used', 'expired'],
    default: 'unused',
    comment: '使用状态',
  })
  status: string;

  @Column({ name: 'order_id', type: 'varchar', length: 100, nullable: true, comment: '关联订单ID' })
  orderId: string;

  @Column({ name: 'claimed_at', type: 'datetime', comment: '领取时间' })
  claimedAt: Date;

  @Column({ name: 'used_at', type: 'datetime', nullable: true, comment: '使用时间' })
  usedAt: Date;

  @Column({ name: 'expire_at', type: 'datetime', nullable: true, comment: '过期时间' })
  expireAt: Date;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  createdAt: Date;

  // 关联关系
  @ManyToOne(() => CouponEntity, coupon => coupon.couponUsers)
  coupon: CouponEntity;
}