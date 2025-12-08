import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../common/base.entity';
import { Payment } from './payment.entity';

@Entity('mall_payment_log')
@Index(['paySn'])
@Index(['operateTime'])
export class PaymentLog extends BaseEntity {
  @Column({ length: 30, name: 'pay_sn' })
  paySn: string;

  @Column({ length: 30, name: 'order_sn' })
  orderSn: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'pay_amount', nullable: true })
  payAmount: number;

  @Column({ length: 32, name: 'operate_id', nullable: true })
  operateId: string;

  @Column({ length: 50, name: 'operate_name', nullable: true })
  operateName: string;

  @Column({ name: 'operate_time', type: 'datetime' })
  operateTime: Date;

  @Column({ name: 'pay_status', nullable: true })
  payStatus: number;

  @Column('text', { name: 'remark', nullable: true })
  remark: string;

  @Column('text', { name: 'request_content', nullable: true })
  requestContent: string;

  @Column('text', { name: 'response_content', nullable: true })
  responseContent: string;

  // 关联关系
  @ManyToOne(() => Payment, (payment) => payment.paymentLogs, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'pay_sn', referencedColumnName: 'paySn' })
  payment: Payment;
}
