import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('mall_payment_record')
export class PaymentRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'varchar', length: 36, nullable: false, comment: '订单ID' })
  orderId: string;

  @Column({ name: 'order_sn', type: 'varchar', length: 50, nullable: false, comment: '订单编号' })
  orderSn: string;

  @Column({ name: 'payment_method_code', type: 'varchar', length: 50, nullable: false, comment: '支付方式编码' })
  paymentMethodCode: string;

  @Column({ name: 'payment_method_name', type: 'varchar', length: 50, nullable: false, comment: '支付方式名称' })
  paymentMethodName: string;

  @Column({ name: 'amount', type: 'decimal', precision: 12, scale: 2, nullable: false, default: '0.00', comment: '支付金额' })
  amount: number;

  @Column({ name: 'currency', type: 'varchar', length: 10, nullable: false, default: 'CNY', comment: '货币类型' })
  currency: string;

  @Column({ name: 'status', type: 'tinyint', nullable: false, default: 0, comment: '支付状态: 0-待支付 1-支付成功 2-支付失败 3-已退款' })
  status: number;

  @Column({ name: 'trade_no', type: 'varchar', length: 100, nullable: true, comment: '支付平台交易号' })
  tradeNo: string;

  @Column({ name: 'out_trade_no', type: 'varchar', length: 100, nullable: false, unique: true, comment: '商户订单号' })
  outTradeNo: string;

  @Column({ name: 'notify_time', type: 'datetime', nullable: true, comment: '通知时间' })
  notifyTime: Date;

  @Column({ name: 'pay_time', type: 'datetime', nullable: true, comment: '支付时间' })
  payTime: Date;

  @Column({ name: 'refund_time', type: 'datetime', nullable: true, comment: '退款时间' })
  refundTime: Date;

  @Column({ name: 'client_ip', type: 'varchar', length: 50, nullable: true, comment: '客户端IP' })
  clientIp: string;

  @Column({ name: 'client_type', type: 'varchar', length: 20, nullable: true, comment: '客户端类型: pc, h5, app, mini_program' })
  clientType: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true, comment: '用户代理' })
  userAgent: string;

  @Column({ name: 'subject', type: 'varchar', length: 200, nullable: true, comment: '商品名称' })
  subject: string;

  @Column({ name: 'body', type: 'varchar', length: 500, nullable: true, comment: '商品描述' })
  body: string;

  @Column({ name: 'return_url', type: 'varchar', length: 500, nullable: true, comment: '返回URL' })
  returnUrl: string;

  @Column({ name: 'extra_param', type: 'json', nullable: true, comment: '额外参数(JSON格式)' })
  extraParam: any;

  @Column({ name: 'error_msg', type: 'varchar', length: 200, nullable: true, comment: '错误信息' })
  errorMsg: string;

  @CreateDateColumn({ name: 'create_time', type: 'datetime', nullable: false, comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'update_time', type: 'datetime', nullable: false, comment: '更新时间' })
  updatedAt: Date;
}
