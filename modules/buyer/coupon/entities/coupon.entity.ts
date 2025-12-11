import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CouponUserEntity } from './coupon-user.entity';

@Entity('coupons')
export class CouponEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '优惠券码' })
  code: string;

  @Column({ type: 'varchar', length: 200, comment: '优惠券名称' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: '优惠券描述' })
  description: string;

  @Column({
    type: 'enum',
    enum: ['discount', 'cash', 'shipping'],
    comment: '优惠券类型',
  })
  type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '折扣金额' })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: '折扣率' })
  discountRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '最低消费金额' })
  minAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '最高优惠金额' })
  maxDiscount: number;

  @Column({ type: 'int', comment: '最大领取数量' })
  maxClaimCount: number;

  @Column({ type: 'int', default: 0, comment: '已领取数量' })
  claimedCount: number;

  @Column({ type: 'int', default: 0, comment: '已使用数量' })
  usedCount: number;

  @Column({ type: 'int', default: 1, comment: '每人限领数量' })
  perPersonLimit: number;

  @Column({ type: 'datetime', comment: '开始时间' })
  startTime: Date;

  @Column({ type: 'datetime', comment: '结束时间' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'expired'],
    default: 'active',
    comment: '状态',
  })
  status: string;

  @Column({ type: 'json', nullable: true, comment: '使用规则' })
  rules: any;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updatedAt: Date;

  // 关联关系
  @OneToMany(() => CouponUserEntity, couponUser => couponUser.coupon)
  couponUsers: CouponUserEntity[];
}