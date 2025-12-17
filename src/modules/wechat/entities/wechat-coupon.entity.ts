import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_coupon')
export class WechatCoupon extends BaseWechatEntity {
  @Column({ length: 100, comment: '卡券ID' })
  couponId: string;

  @Column({ length: 200, comment: '卡券标题' })
  title: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-未使用，2-已使用，3-已过期' })
  status: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '面额' })
  value: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '最低消费' })
  leastCost: number;

  @Column({ type: 'datetime', comment: '开始时间' })
  beginTime: Date;

  @Column({ type: 'datetime', comment: '结束时间' })
  endTime: Date;

  @Column({ length: 50, nullable: true, comment: '用户openid' })
  openid: string;

  @Column({ type: 'datetime', nullable: true, comment: '使用时间' })
  consumeTime: Date;
}