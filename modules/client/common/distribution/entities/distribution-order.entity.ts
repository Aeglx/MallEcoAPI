import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Distribution } from './distribution.entity';
import { Order } from '../../order/entities/order.entity';

@Entity('distribution_order')
@Index(['distributionId'])
@Index(['orderId'])
@Index(['commissionStatus'])
export class DistributionOrder {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'distribution_id', type: 'bigint', comment: '分销员ID' })
  distributionId: string;

  @Column({ name: 'order_id', type: 'bigint', comment: '订单ID' })
  orderId: string;

  @Column({ name: 'parent_distribution_id', type: 'bigint', nullable: true, comment: '上级分销员ID' })
  parentDistributionId: string;

  @Column({ name: 'grand_parent_distribution_id', type: 'bigint', nullable: true, comment: '上上级分销员ID' })
  grandParentDistributionId: string;

  @Column({ name: 'buyer_id', type: 'bigint', comment: '购买者ID' })
  buyerId: string;

  @Column({ name: 'order_sn', type: 'varchar', length: 64, comment: '订单编号' })
  orderSn: string;

  @Column({ name: 'order_amount', type: 'decimal', precision: 12, scale: 2, comment: '订单金额' })
  orderAmount: number;

  @Column({ name: 'product_amount', type: 'decimal', precision: 12, scale: 2, comment: '商品金额' })
  productAmount: number;

  @Column({ name: 'first_commission', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '一级佣金' })
  firstCommission: number;

  @Column({ name: 'second_commission', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '二级佣金' })
  secondCommission: number;

  @Column({ name: 'third_commission', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '三级佣金' })
  thirdCommission: number;

  @Column({ name: 'total_commission', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '总佣金' })
  totalCommission: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'paid', 'shipped', 'completed', 'cancelled', 'refunded'],
    default: 'pending',
    comment: '佣金状态：pending-待确认，confirmed-已确认，paid-已结算，shipped-已发货，completed-已完成，cancelled-已取消，refunded-已退款'
  })
  commissionStatus: string;

  @Column({ name: 'settlement_time', type: 'datetime', nullable: true, comment: '结算时间' })
  settlementTime: Date;

  @Column({ name: 'settlement_user_id', type: 'bigint', nullable: true, comment: '结算人ID' })
  settlementUserId: string;

  @Column({ name: 'refund_time', type: 'datetime', nullable: true, comment: '退款时间' })
  refundTime: Date;

  @Column({ name: 'refund_commission', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '退款佣金' })
  refundCommission: number;

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2, comment: '佣金比例' })
  commissionRate: number;

  @Column({ name: 'commission_level', type: 'int', comment: '佣金层级：1-一级，2-二级，3-三级' })
  commissionLevel: number;

  @Column({ name: 'product_ids', type: 'text', nullable: true, comment: '商品ID列表' })
  productIds: string;

  @Column({ name: 'product_names', type: 'text', nullable: true, comment: '商品名称列表' })
  productNames: string;

  @Column({ name: 'sku_ids', type: 'text', nullable: true, comment: 'SKU ID列表' })
  skuIds: string;

  @Column({ name: 'sku_names', type: 'text', nullable: true, comment: 'SKU名称列表' })
  skuNames: string;

  @Column({ name: 'quantities', type: 'text', nullable: true, comment: '数量列表' })
  quantities: string;

  @Column({ name: 'remark', type: 'text', nullable: true, comment: '备注' })
  remark: string;

  // 关联关系
  @ManyToOne(() => Distribution, distribution => distribution.orders)
  distribution: Distribution;

  @ManyToOne(() => Order)
  order: Order;

  @CreateDateColumn({ name: 'create_time', type: 'datetime', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', type: 'datetime', comment: '更新时间' })
  updateTime: Date;
}