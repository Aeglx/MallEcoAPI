import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

export enum TransactionType {
  INCOME = 1, // 收入
  EXPENSE = 2, // 支出
}

export enum TransactionStatus {
  SUCCESS = 1, // 成功
  FAILURE = 2, // 失败
  PENDING = 3, // 处理�?
}

export enum TransactionBusinessType {
  RECHARGE = 1, // 充�?
  WITHDRAW = 2, // 提现
  ORDER_PAYMENT = 3, // 订单支付
  ORDER_REFUND = 4, // 订单退�?
  REFERRAL_REWARD = 5, // 推荐奖励
  SYSTEM_REWARD = 6, // 系统奖励
  PENALTY = 7, // 惩罚扣款
  OTHER = 8, // 其他
}

@Entity('mall_wallet_transaction')
@Index(['userId'])
@Index(['walletId'])
@Index(['transactionType'])
@Index(['status'])
@Index(['businessType'])
@Index(['businessId'])
@Index(['createTime'])
export class WalletTransaction extends BaseEntity {
  @Column({ name: 'wallet_id', type: 'varchar', length: 36, nullable: false })
  walletId: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36, nullable: false })
  userId: string;

  @Column({ name: 'transaction_type', type: 'tinyint', nullable: false })
  transactionType: TransactionType;

  @Column({ name: 'amount', type: 'decimal', precision: 15, scale: 2, nullable: false })
  amount: number;

  @Column({ name: 'balance_before', type: 'decimal', precision: 15, scale: 2, nullable: false })
  balanceBefore: number;

  @Column({ name: 'balance_after', type: 'decimal', precision: 15, scale: 2, nullable: false })
  balanceAfter: number;

  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: TransactionStatus;

  @Column({ name: 'business_type', type: 'tinyint', nullable: false })
  businessType: TransactionBusinessType;

  @Column({ name: 'business_id', type: 'varchar', length: 36, nullable: true })
  businessId: string;

  @Column({ name: 'remark', type: 'varchar', length: 255, nullable: true })
  remark: string;

  @Column({ name: 'operator', type: 'varchar', length: 36, nullable: true })
  operator: string;

  @Column({ name: 'extra', type: 'text', nullable: true })
  extra: string;
}
