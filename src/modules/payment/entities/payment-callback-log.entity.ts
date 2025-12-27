import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('mall_payment_callback_log')
export class PaymentCallbackLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'payment_record_id',
    type: 'varchar',
    length: 36,
    nullable: false,
    comment: '支付记录ID',
  })
  paymentRecordId: string;

  @Column({ name: 'order_id', type: 'varchar', length: 36, nullable: false, comment: '订单ID' })
  orderId: string;

  @Column({
    name: 'out_trade_no',
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: '商户订单号',
  })
  outTradeNo: string;

  @Column({
    name: 'trade_no',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '支付平台交易号',
  })
  tradeNo: string;

  @Column({
    name: 'payment_method_code',
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: '支付方式编码',
  })
  paymentMethodCode: string;

  @Column({ name: 'request_data', type: 'text', nullable: true, comment: '请求数据' })
  requestData: string;

  @Column({ name: 'response_data', type: 'text', nullable: true, comment: '响应数据' })
  responseData: string;

  @Column({
    name: 'status',
    type: 'tinyint',
    nullable: false,
    default: 0,
    comment: '处理状态: 0-失败 1-成功',
  })
  status: number;

  @Column({ name: 'error_msg', type: 'varchar', length: 200, nullable: true, comment: '错误信息' })
  errorMsg: string;

  @CreateDateColumn({ name: 'create_time', type: 'datetime', nullable: false, comment: '创建时间' })
  createdAt: Date;
}
