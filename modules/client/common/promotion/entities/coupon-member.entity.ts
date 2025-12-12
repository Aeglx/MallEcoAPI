import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 会员优惠券实体
 */
@Entity('t_coupon_member')
export class CouponMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36, comment: '优惠券ID' })
  couponId: string;

  @Column({ length: 36, comment: '会员ID' })
  memberId: string;

  @Column({ length: 50, comment: '会员名称' })
  memberName: string;

  @Column({ length: 36, comment: '订单ID（使用后记录）' })
  orderId: string;

  @Column({ length: 50, comment: '订单编号' })
  orderNo: string;

  @Column({ type: 'int', default: 0, comment: '使用状态 0-未使用 1-已使用 2-已过期' })
  status: number;

  @Column({ type: 'datetime', nullable: true, comment: '使用时间' })
  useTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '过期时间' })
  expireTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '失效时间（注销等情况）' })
  invalidTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '优惠金额' })
  discountAmount: number;

  @Column({ length: 50, nullable: true, comment: '来源' })
  source: string;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @Column({ type: 'int', default: 0, comment: '删除标记 0-未删除 1-已删除' })
  deleteFlag: number;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}