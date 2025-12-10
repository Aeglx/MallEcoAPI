import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 会员钱包实体
 */
@Entity('t_wallet')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36, comment: '会员ID' })
  memberId: string;

  @Column({ length: 50, comment: '会员名称' })
  memberName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '可用余额' })
  balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '冻结余额' })
  frozenBalance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '累计充值金额' })
  totalRecharge: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '累计提现金额' })
  totalWithdraw: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '累计消费金额' })
  totalConsume: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '累计佣金收入' })
  totalCommission: number;

  @Column({ type: 'int', default: 0, comment: '钱包状态 0-正常 1-冻结 2-关闭' })
  status: number;

  @Column({ type: 'int', default: 0, comment: '支付密码设置状态 0-未设置 1-已设置' })
  payPasswordStatus: number;

  @Column({ length: 255, nullable: true, comment: '支付密码加密串' })
  payPassword: string;

  @Column({ length: 32, nullable: true, comment: '支付密码盐值' })
  payPasswordSalt: string;

  @Column({ type: 'int', default: 0, comment: '当日充值失败次数' })
  dailyRechargeFailCount: number;

  @Column({ type: 'int', default: 0, comment: '当日提现失败次数' })
  dailyWithdrawFailCount: number;

  @Column({ type: 'datetime', nullable: true, comment: '最后一次充值时间' })
  lastRechargeTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '最后一次提现时间' })
  lastWithdrawTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '最后一次消费时间' })
  lastConsumeTime: Date;

  @Column({ type: 'int', default: 0, comment: '删除标志 0-未删除 1-已删除' })
  deleteFlag: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}