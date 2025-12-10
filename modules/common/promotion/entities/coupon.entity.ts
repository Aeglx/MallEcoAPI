import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 优惠券实体
 */
@Entity('t_coupon')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, comment: '优惠券名称' })
  name: string;

  @Column({ length: 20, unique: true, comment: '优惠券编码' })
  code: string;

  @Column({ type: 'int', comment: '优惠券类型 1-满减券 2-折扣券 3-现金券' })
  type: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '面额' })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '最低消费金额' })
  minAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, comment: '折扣率' })
  discount: number;

  @Column({ type: 'int', comment: '发放方式 1-主动领取 2-系统发放 3-注册赠送 4-活动赠送' })
  grantType: number;

  @Column({ type: 'int', comment: '使用范围 0-全场通用 1-指定商品 2-指定分类 3-指定品牌' })
  useRange: number;

  @Column({ type: 'text', nullable: true, comment: '适用范围ID列表，JSON格式' })
  useRangeIds: string;

  @Column({ type: 'int', default: 1, comment: '状态 0-禁用 1-启用' })
  status: number;

  @Column({ type: 'int', default: 0, comment: '发放总数 0表示不限制' })
  totalCount: number;

  @Column({ type: 'int', default: 0, comment: '已领取数量' })
  receivedCount: number;

  @Column({ type: 'int', default: 0, comment: '已使用数量' })
  usedCount: number;

  @Column({ type: 'datetime', nullable: true, comment: '发放开始时间' })
  grantStartTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '发放结束时间' })
  grantEndTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '有效开始时间' })
  validStartTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '有效结束时间' })
  validEndTime: Date;

  @Column({ type: 'int', default: 1, comment: '有效期类型 1-固定时间 2-领取后N天有效' })
  validType: number;

  @Column({ type: 'int', default: 0, comment: '有效天数（当validType为2时有效）' })
  validDays: number;

  @Column({ type: 'int', default: 1, comment: '每人限领数量 0表示不限制' })
  limitCount: number;

  @Column({ type: 'text', nullable: true, comment: '使用说明' })
  description: string;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;

  @Column({ length: 50, nullable: true, comment: '创建人' })
  createBy: string;

  @Column({ length: 50, nullable: true, comment: '更新人' })
  updateBy: string;

  @Column({ type: 'int', default: 0, comment: '删除标志 0-未删除 1-已删除' })
  deleteFlag: number;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}