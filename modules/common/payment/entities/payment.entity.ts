import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../common/base.entity';
import { PaymentLog } from './payment-log.entity';

@Entity('mall_payment')
@Index(['paySn'])
@Index(['orderSn'])
@Index(['payStatus'])
@Index(['payType'])
export class Payment extends BaseEntity {
  @Column({ length: 30, unique: true, name: 'pay_sn' })
  paySn: string;

  @Column({ length: 30, name: 'order_sn' })
  orderSn: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'pay_amount' })
  payAmount: number;

  @Column({ name: 'pay_status' })
  payStatus: number;

  @Column({ length: 20, name: 'pay_type' })
  payType: string;

  @Column({ name: 'pay_time', type: 'datetime', nullable: true })
  payTime: Date;

  @Column({ name: 'refund_time', type: 'datetime', nullable: true })
  refundTime: Date;

  @Column({ length: 50, name: 'transaction_id', nullable: true })
  transactionId: string;

  @Column({ length: 255, name: 'callback_url', nullable: true })
  callbackUrl: string;

  @Column({ length: 255, name: 'return_url', nullable: true })
  returnUrl: string;

  @Column({ type: 'text', name: 'extend_params', nullable: true })
  extendParams: string;

  @Column({ type: 'text', name: 'callback_content', nullable: true })
  callbackContent: string;

  // 关联关系
  @OneToMany(() => PaymentLog, (paymentLog) => paymentLog.payment)
  paymentLogs: PaymentLog[];
}
