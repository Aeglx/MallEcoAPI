import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { WalletEntity } from './wallet.entity';

@Entity('wallet_transactions')
export class WalletTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', comment: '用户ID' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ['recharge', 'withdraw', 'payment', 'refund', 'exchange', 'freeze', 'unfreeze'],
    comment: '交易类型',
  })
  type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '变动金额' })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '变动前余额' })
  balanceBefore: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '变动后余额' })
  balanceAfter: number;

  @Column({ type: 'text', nullable: true, comment: '备注说明' })
  remark: string;

  @Column({ name: 'order_no', type: 'varchar', length: 100, nullable: true, comment: '关联订单号' })
  orderNo: string;

  @Column({ name: 'transaction_id', type: 'varchar', length: 100, nullable: true, comment: '第三方交易ID' })
  transactionId: string;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  createdAt: Date;

  // 关联关系
  @ManyToOne(() => WalletEntity, wallet => wallet.transactions)
  wallet: WalletEntity;
}