import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 钱包流水记录实体
 */
@Entity('t_wallet_record')
export class WalletRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36, comment: '会员ID' })
  memberId: string;

  @Column({ length: 50, comment: '会员名称' })
  memberName: string;

  @Column({ type: 'int', comment: '变动类型 1-充值 2-提现 3-消费 4-退款 5-佣金 6-奖励 7-罚扣 8-转账' })
  type: number;

  @Column({ type: 'int', comment: '变动方向 1-收入 2-支出' })
  direction: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '变动金额' })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '变动前余额' })
  beforeBalance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '变动后余额' })
  afterBalance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '变动前冻结余额' })
  beforeFrozenBalance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '变动后冻结余额' })
  afterFrozenBalance: number;

  @Column({ length: 50, nullable: true, comment: '关联业务类型' })
  businessType: string;

  @Column({ length: 36, nullable: true, comment: '关联业务ID' })
  businessId: string;

  @Column({ length: 100, nullable: true, comment: '关联业务编号' })
  businessNo: string;

  @Column({ length: 200, nullable: true, comment: '交易说明' })
  description: string;

  @Column({ length: 36, nullable: true, comment: '转账目标会员ID' })
  targetMemberId: string;

  @Column({ length: 50, nullable: true, comment: '转账目标会员名称' })
  targetMemberName: string;

  @Column({ type: 'int', default: 0, comment: '交易状态 0-处理中 1-成功 2-失败' })
  status: number;

  @Column({ type: 'datetime', nullable: true, comment: '交易完成时间' })
  completeTime: Date;

  @Column({ type: 'text', nullable: true, comment: '失败原因' })
  failReason: string;

  @Column({ length: 50, nullable: true, comment: '第三方交易号' })
  thirdTradeNo: string;

  @Column({ length: 50, nullable: true, comment: '支付渠道' })
  paymentChannel: string;

  @Column({ length: 36, nullable: true, comment: '操作人ID' })
  operatorId: string;

  @Column({ length: 50, nullable: true, comment: '操作人名称' })
  operatorName: string;

  @Column({ type: 'int', default: 0, comment: '删除标志 0-未删除 1-已删除' })
  deleteFlag: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}