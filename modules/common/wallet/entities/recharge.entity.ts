import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 充值订单实体
 */
@Entity('t_recharge')
export class Recharge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36, comment: '会员ID' })
  memberId: string;

  @Column({ length: 50, comment: '会员名称' })
  memberName: string;

  @Column({ length: 50, unique: true, comment: '充值订单号' })
  orderNo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '充值金额' })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '实际到账金额' })
  actualAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '手续费' })
  fee: number;

  @Column({ type: 'int', comment: '充值方式 1-支付宝 2-微信 3-银行卡 4-余额' })
  rechargeType: number;

  @Column({ type: 'int', default: 0, comment: '支付状态 0-待支付 1-支付中 2-支付成功 3-支付失败 4-已取消' })
  payStatus: number;

  @Column({ type: 'int', default: 0, comment: '到账状态 0-未到账 1-已到账 2-到账失败' })
  accountStatus: number;

  @Column({ length: 50, nullable: true, comment: '第三方支付单号' })
  thirdPayNo: string;

  @Column({ length: 50, nullable: true, comment: '支付渠道' })
  paymentChannel: string;

  @Column({ type: 'datetime', nullable: true, comment: '支付时间' })
  payTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '到账时间' })
  accountTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '支付完成时间' })
  completeTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '取消时间' })
  cancelTime: Date;

  @Column({ type: 'text', nullable: true, comment: '支付回调数据' })
  callbackData: string;

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