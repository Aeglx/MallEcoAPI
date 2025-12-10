import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 提现申请实体
 */
@Entity('t_withdraw')
export class Withdraw {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36, comment: '会员ID' })
  memberId: string;

  @Column({ length: 50, comment: '会员名称' })
  memberName: string;

  @Column({ length: 50, unique: true, comment: '提现单号' })
  withdrawNo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '提现金额' })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '实际到账金额' })
  actualAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '手续费' })
  fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '税率' })
  taxRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '税费' })
  taxAmount: number;

  @Column({ type: 'int', comment: '提现方式 1-支付宝 2-微信 3-银行卡' })
  withdrawType: number;

  @Column({ type: 'int', default: 0, comment: '审核状态 0-待审核 1-审核通过 2-审核拒绝 3-处理中 4-已打款 5-提现失败' })
  auditStatus: number;

  @Column({ type: 'int', default: 0, comment: '处理状态 0-待处理 1-处理中 2-已完成 3-处理失败' })
  processStatus: number;

  @Column({ length: 36, nullable: true, comment: '银行账户ID' })
  bankAccountId: string;

  @Column({ length: 100, nullable: true, comment: '银行账号' })
  bankAccountNo: string;

  @Column({ length: 100, nullable: true, comment: '开户名' })
  accountName: string;

  @Column({ length: 100, nullable: true, comment: '开户行' })
  bankName: string;

  @Column({ length: 50, nullable: true, comment: '支付宝账号' })
  alipayAccount: string;

  @Column({ length: 100, nullable: true, comment: '支付宝实名' })
  alipayName: string;

  @Column({ length: 50, nullable: true, comment: '微信账号' })
  wechatAccount: string;

  @Column({ length: 100, nullable: true, comment: '微信实名' })
  wechatName: string;

  @Column({ type: 'datetime', nullable: true, comment: '申请时间' })
  applyTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '审核时间' })
  auditTime: Date;

  @Column({ length: 36, nullable: true, comment: '审核人ID' })
  auditorId: string;

  @Column({ length: 50, nullable: true, comment: '审核人名称' })
  auditorName: string;

  @Column({ type: 'datetime', nullable: true, comment: '打款时间' })
  paymentTime: Date;

  @Column({ length: 50, nullable: true, comment: '打款渠道' })
  paymentChannel: string;

  @Column({ length: 50, nullable: true, comment: '第三方交易号' })
  thirdTradeNo: string;

  @Column({ type: 'text', nullable: true, comment: '审核意见' })
  auditRemark: string;

  @Column({ type: 'text', nullable: true, comment: '拒绝原因' })
  rejectReason: string;

  @Column({ type: 'text', nullable: true, comment: '失败原因' })
  failReason: string;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @Column({ type: 'int', default: 0, comment: '删除标志 0-未删除 1-已删除' })
  deleteFlag: number;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}