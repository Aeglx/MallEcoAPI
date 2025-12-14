import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../../common/base.entity';

@Entity('mall_coupon')
export class Coupon extends BaseEntity {
  @Column({ name: 'coupon_name', length: 100, nullable: false, comment: '优惠券名称' })
  couponName: string;

  @Column({ name: 'coupon_type', type: 'tinyint', default: 0, comment: '优惠券类型：0-满减券，1-折扣券，2-免运费券' })
  couponType: number;

  @Column({ name: 'total_count', type: 'int', default: 0, comment: '总数量' })
  totalCount: number;

  @Column({ name: 'used_count', type: 'int', default: 0, comment: '已使用数量' })
  usedCount: number;

  @Column({ name: 'min_amount', type: 'decimal', precision: 10, scale: 2, default: 0, comment: '最低使用金额' })
  minAmount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0, comment: '减免金额' })
  discountAmount: number;

  @Column({ name: 'discount_rate', type: 'decimal', precision: 3, scale: 1, default: 10, comment: '折扣率(1-10)' })
  discountRate: number;

  @Column({ name: 'start_time', type: 'datetime', nullable: false, comment: '开始时间' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime', nullable: false, comment: '结束时间' })
  endTime: Date;

  @Column({ name: 'status', type: 'tinyint', default: 0, comment: '状态：0-未发布，1-进行中，2-已结束' })
  status: number;

  @Column({ name: 'is_reusable', type: 'tinyint', default: 0, comment: '是否可重复使用' })
  isReusable: number;

  @Column({ name: 'applicable_range', type: 'tinyint', default: 0, comment: '适用范围：0-全场通用，1-指定商品，2-指定分类' })
  applicableRange: number;

  @Column({ name: 'applicable_ids', type: 'varchar', length: 255, nullable: true, comment: '适用商品/分类ID' })
  applicableIds: string;
}
