import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { WalletTransactionEntity } from './wallet-transaction.entity';
import { RechargeOrderEntity } from './recharge-order.entity';
import { WithdrawOrderEntity } from './withdraw-order.entity';
import { PointsExchangeEntity } from './points-exchange.entity';

@Entity('wallets')
export class WalletEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', comment: '用户ID' })
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '余额' })
  balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '冻结金额' })
  frozenAmount: number;

  @Column({ type: 'int', default: 0, comment: '积分' })
  points: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '总收入' })
  totalIncome: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '总支出' })
  totalExpense: number;

  @Column({
    type: 'enum',
    enum: ['active', 'frozen', 'closed'],
    default: 'active',
    comment: '状态',
  })
  status: string;

  @Column({ type: 'datetime', nullable: true, comment: '最后交易时间' })
  lastTransactionTime: Date;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updatedAt: Date;

  // 关联关系
  @OneToMany(() => WalletTransactionEntity, transaction => transaction.wallet)
  transactions: WalletTransactionEntity[];

  @OneToMany(() => RechargeOrderEntity, rechargeOrder => rechargeOrder.wallet)
  rechargeOrders: RechargeOrderEntity[];

  @OneToMany(() => WithdrawOrderEntity, withdrawOrder => withdrawOrder.wallet)
  withdrawOrders: WithdrawOrderEntity[];

  @OneToMany(() => PointsExchangeEntity, pointsExchange => pointsExchange.wallet)
  pointsExchanges: PointsExchangeEntity[];
}