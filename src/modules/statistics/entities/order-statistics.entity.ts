import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('order_statistics')
@Index(['statDate', 'orderStatus'])
@Index(['statDate', 'paymentMethod'])
export class OrderStatistics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', comment: '统计日期' })
  statDate: string;

  @Column({ type: 'varchar', length: 20, default: 'pending', comment: '订单状态' })
  orderStatus: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '支付方式' })
  paymentMethod: string;

  @Column({ type: 'int', default: 0, comment: '订单数量' })
  orderCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '订单金额' })
  orderAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '平均订单金额' })
  avgOrderAmount: number;

  @Column({ type: 'int', default: 0, comment: '成功订单数' })
  successfulOrders: number;

  @Column({ type: 'int', default: 0, comment: '失败订单数' })
  failedOrders: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, comment: '订单成功率' })
  successRate: number;

  @Column({ type: 'int', default: 0, comment: '退款订单数' })
  refundOrders: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '退款金额' })
  refundAmount: number;

  @Column({ type: 'int', default: 0, comment: '取消订单数' })
  canceledOrders: number;

  @Column({ type: 'varchar', length: 50, default: 'daily', comment: '统计粒度: daily, weekly, monthly' })
  granularity: string;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date;
}
