import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { WalletEntity } from './wallet.entity';

@Entity('withdraw_orders')
export class WithdrawOrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', comment: '用户ID' })
  userId: string;

  @Column({ name: 'order_no', unique: true, comment: '订单号' })
  orderNo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '提现金额' })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '手续费' })
  fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '实际到账金额' })
  actualAmount: number;

  @Column({
    name: 'withdraw_method',
    type: 'enum',
    enum: ['alipay', 'wechat', 'bank_card'],
    comment: '提现方式',
  })
  withdrawMethod: string;

  @Column({ type: 'json', nullable: true, comment: '账户信息' })
  accountInfo: any;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
    comment: '提现状态',
  })
  status: string;

  @Column({ type: 'datetime', nullable: true, comment: '审核时间' })
  auditTime: Date;

  @Column({ type: 'text', nullable: true, comment: '审核备注' })
  auditRemark: string;

  @Column({ type: 'datetime', nullable: true, comment: '处理时间' })
  processTime: Date;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updated_at', type: 'datetime', comment: '更新时间' })
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => WalletEntity, wallet => wallet.withdrawOrders)
  wallet: WalletEntity;
}