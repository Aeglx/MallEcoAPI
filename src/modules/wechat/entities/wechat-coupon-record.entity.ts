import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_coupon_record')
export class WechatCouponRecord extends BaseWechatEntity {
  @Column({ length: 100, comment: '卡券ID' })
  couponId: string;

  @Column({ length: 50, comment: '用户openid' })
  openid: string;

  @Column({ type: 'tinyint', default: 1, comment: '核销状态：1-待核销，2-已核销，3-已过期' })
  status: number;

  @Column({ type: 'datetime', comment: '核销时间' })
  verifyTime: Date;

  @Column({ length: 100, nullable: true, comment: '核销门店' })
  verifyStore: string;

  @Column({ type: 'text', nullable: true, comment: '核销备注' })
  verifyRemark: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '订单金额' })
  orderAmount: number;

  @Column({ length: 100, nullable: true, comment: '订单号' })
  orderId: string;
}