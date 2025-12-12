import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { WalletEntity } from './wallet.entity';

@Entity('recharge_orders')
export class RechargeOrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', comment: '用户ID' })
  userId: string;

  @Column({ name: 'order_no', unique: true, comment: '订单号' })
  orderNo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '充值金额' })
  amount: number;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: ['alipay', 'wechat', 'bank_card', 'paypal'],
    comment: '支付方式',
  })
  paymentMethod: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending',
    comment: '订单状态',
  })
  status: string;

  @Column({ name: 'transaction_id', type: 'varchar', length: 100, nullable: true, comment: '第三方交易ID' })
  transactionId: string;

  @Column({ type: 'datetime', nullable: true, comment: '支付时间' })
  payTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '过期时间' })
  expireTime: Date;

  @Column({ type: 'text', nullable: true, comment: '支付备注' })
  remark: string;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updated_at', type: 'datetime', comment: '更新时间' })
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => WalletEntity, wallet => wallet.rechargeOrders)
  wallet: WalletEntity;
}