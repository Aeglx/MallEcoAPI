import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('mall_order')
export class Order extends BaseEntity {
  @Column({ name: 'order_sn', nullable: false, unique: true, comment: '订单编号' })
  orderSn: string;

  @Column({ name: 'user_id', nullable: false, comment: '用户ID' })
  userId: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, default: 0, comment: '订单总金额' })
  totalAmount: number;

  @Column({ name: 'pay_amount', type: 'decimal', precision: 10, scale: 2, default: 0, comment: '实际支付金额' })
  payAmount: number;

  @Column({ name: 'coupon_amount', type: 'decimal', precision: 10, scale: 2, default: 0, comment: '优惠券金额' })
  couponAmount: number;

  @Column({ name: 'shipping_fee', type: 'decimal', precision: 10, scale: 2, default: 0, comment: '运费' })
  shippingFee: number;

  @Column({ name: 'pay_type', nullable: false, default: 0, comment: '支付方式：0-未选择，1-支付宝，2-微信' })
  payType: number;

  @Column({ name: 'status', nullable: false, default: 0, comment: '订单状态：0-待付款，1-待发货，2-待收货，3-待评价，4-已完成，5-已取消' })
  status: number;

  @Column({ name: 'shipping_name', nullable: true, comment: '配送方式名称' })
  shippingName: string;

  @Column({ name: 'shipping_code', nullable: true, comment: '配送方式代码' })
  shippingCode: string;

  @Column({ name: 'payment_time', nullable: true, type: 'datetime', comment: '支付时间' })
  paymentTime: Date;

  @Column({ name: 'shipping_time', nullable: true, type: 'datetime', comment: '发货时间' })
  shippingTime: Date;

  @Column({ name: 'confirm_time', nullable: true, type: 'datetime', comment: '确认收货时间' })
  confirmTime: Date;

  @Column({ name: 'end_time', nullable: true, type: 'datetime', comment: '订单结束时间' })
  endTime: Date;

  @Column({ name: 'consignee', nullable: false, comment: '收货人姓名' })
  consignee: string;

  @Column({ name: 'mobile', nullable: false, comment: '收货人手机号' })
  mobile: string;

  @Column({ name: 'province', nullable: true, comment: '省份' })
  province: string;

  @Column({ name: 'city', nullable: true, comment: '城市' })
  city: string;

  @Column({ name: 'district', nullable: true, comment: '区/县' })
  district: string;

  @Column({ name: 'address', nullable: false, comment: '详细地址' })
  address: string;

  @Column({ name: 'zip_code', nullable: true, comment: '邮政编码' })
  zipCode: string;

  @Column({ name: 'user_note', nullable: true, comment: '用户订单备注' })
  userNote: string;

  @Column({ name: 'admin_note', nullable: true, comment: '管理员备注' })
  adminNote: string;

  @Column({ name: 'is_deleted', nullable: false, default: 0, comment: '是否删除：0-否，1-是' })
  isDeleted: number;
}
