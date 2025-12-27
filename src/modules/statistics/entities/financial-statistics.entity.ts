import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('financial_statistics')
@Index(['statDate', 'accountType'])
@Index(['statDate', 'transactionType'])
export class FinancialStatistics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', comment: '统计日期' })
  statDate: string;

  @Column({ type: 'varchar', length: 20, default: 'income', comment: '账户类型: income, expense' })
  accountType: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '交易类型' })
  transactionType: string;

  @Column({ type: 'int', default: 0, comment: '交易笔数' })
  transactionCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '交易金额' })
  transactionAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '收入金额' })
  incomeAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '支出金额' })
  expenseAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '净利润' })
  netProfit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '平台佣金' })
  platformCommission: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '税费' })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '总资产' })
  totalAssets: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '总负债' })
  totalLiabilities: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '净资产' })
  netAssets: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'daily',
    comment: '统计粒度: daily, weekly, monthly',
  })
  granularity: string;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date;
}
