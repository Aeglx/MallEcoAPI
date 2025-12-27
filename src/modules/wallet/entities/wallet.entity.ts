import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('mall_wallet')
@Index(['userId'], { unique: true })
@Index(['balance'])
@Index(['frozenAmount'])
export class Wallet extends BaseEntity {
  @Column({ name: 'user_id', type: 'varchar', length: 36, nullable: false })
  userId: string;

  @Column({ name: 'balance', type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  balance: number;

  @Column({ name: 'frozen_amount', type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  frozenAmount: number;

  @Column({ name: 'total_income', type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  totalIncome: number;

  @Column({ name: 'total_expense', type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  totalExpense: number;

  @Column({ name: 'last_operate_time', type: 'datetime', nullable: true })
  lastOperateTime: Date;

  @Column({ name: 'last_operate_desc', type: 'varchar', length: 255, nullable: true })
  lastOperateDesc: string;
}
