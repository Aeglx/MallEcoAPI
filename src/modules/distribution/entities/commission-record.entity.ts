import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('mall_commission_record')
export class CommissionRecord extends BaseEntity {
  @Index('idx_distributor_id')
  @Column({ name: 'distributor_id', length: 36, nullable: false, comment: '分销商ID' })
  distributorId: string;

  @Index('idx_order_id')
  @Column({ name: 'order_id', length: 36, nullable: false, comment: '订单ID' })
  orderId: string;

  @Index('idx_user_id')
  @Column({ name: 'user_id', length: 36, nullable: false, comment: '用户ID' })
  userId: string;

  @Column({
    name: 'order_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '订单金额',
  })
  orderAmount: number;

  @Column({
    name: 'commission_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '佣金金额',
  })
  commissionAmount: number;

  @Column({
    name: 'commission_rate',
    type: 'decimal',
    precision: 4,
    scale: 2,
    default: 0,
    comment: '佣金比例(%)',
  })
  commissionRate: number;

  @Column({
    name: 'status',
    type: 'tinyint',
    default: 0,
    comment: '状态：0-待结算，1-已结算，2-已取消',
  })
  status: number;

  @Column({ name: 'settlement_time', type: 'datetime', nullable: true, comment: '结算时间' })
  settlementTime: Date;

  @Column({ name: 'remark', type: 'varchar', length: 255, nullable: true, comment: '备注' })
  remark: string;
}
