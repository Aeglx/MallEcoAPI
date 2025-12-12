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

@Entity('distribution_cash')
@Index(['distributionId'])
@Index(['status'])
@Index(['cashNo'])
export class DistributionCash {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'distribution_id', type: 'bigint', comment: '分销员ID' })
  distributionId: string;

  @Column({ name: 'cash_no', type: 'varchar', length: 64, unique: true, comment: '提现单号' })
  cashNo: string;

  @Column({ name: 'cash_amount', type: 'decimal', precision: 12, scale: 2, comment: '提现金额' })
  cashAmount: number;

  @Column({ name: 'fee_amount', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '手续费' })
  feeAmount: number;

  @Column({ name: 'actual_amount', type: 'decimal', precision: 12, scale: 2, comment: '实际到账金额' })
  actualAmount: number;

  @Column({
    type: 'enum',
    enum: ['alipay', 'wechat', 'bank'],
    default: 'alipay',
    comment: '提现方式：alipay-支付宝，wechat-微信，bank-银行卡'
  })
  cashMethod: string;

  @Column({ name: 'account_no', type: 'varchar', length: 100, comment: '提现账号' })
  accountNo: string;

  @Column({ name: 'account_name', type: 'varchar', length: 100, comment: '账户姓名' })
  accountName: string;

  @Column({ name: 'bank_name', type: 'varchar', length: 100, nullable: true, comment: '银行名称' })
  bankName: string;

  @Column({ name: 'bank_branch', type: 'varchar', length: 200, nullable: true, comment: '开户行' })
  bankBranch: string;

  @Column({ name: 'mobile', type: 'varchar', length: 20, nullable: true, comment: '手机号' })
  mobile: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'rejected', 'cancelled'],
    default: 'pending',
    comment: '状态：pending-待审核，processing-处理中，completed-已完成，rejected-已拒绝，cancelled-已取消'
  })
  status: string;

  @Column({ name: 'audit_time', type: 'datetime', nullable: true, comment: '审核时间' })
  auditTime: Date;

  @Column({ name: 'audit_user_id', type: 'bigint', nullable: true, comment: '审核人ID' })
  auditUserId: string;

  @Column({ name: 'audit_remark', type: 'text', nullable: true, comment: '审核备注' })
  auditRemark: string;

  @Column({ name: 'process_time', type: 'datetime', nullable: true, comment: '处理时间' })
  processTime: Date;

  @Column({ name: 'process_user_id', type: 'bigint', nullable: true, comment: '处理人ID' })
  processUserId: string;

  @Column({ name: 'transaction_no', type: 'varchar', length: 100, nullable: true, comment: '交易流水号' })
  transactionNo: string;

  @Column({ name: 'complete_time', type: 'datetime', nullable: true, comment: '完成时间' })
  completeTime: Date;

  @Column({ name: 'reject_reason', type: 'text', nullable: true, comment: '拒绝原因' })
  rejectReason: string;

  @Column({ name: 'cancel_reason', type: 'text', nullable: true, comment: '取消原因' })
  cancelReason: string;

  @Column({ name: 'remark', type: 'text', nullable: true, comment: '备注' })
  remark: string;

  // 关联关系
  @ManyToOne(() => Distribution, distribution => distribution.orders)
  distribution: Distribution;

  @CreateDateColumn({ name: 'create_time', type: 'datetime', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', type: 'datetime', comment: '更新时间' })
  updateTime: Date;
}