import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_coupon_template')
export class WechatCouponTemplate extends BaseWechatEntity {
  @Column({ length: 100, comment: '模板ID' })
  templateId: string;

  @Column({ length: 200, comment: '模板标题' })
  title: string;

  @Column({ type: 'text', comment: '使用说明' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '面额' })
  value: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '最低消费' })
  leastCost: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @Column({ type: 'int', default: 0, comment: '发放数量' })
  quantity: number;

  @Column({ type: 'int', default: 0, comment: '已领取数量' })
  receivedCount: number;

  @Column({ type: 'int', default: 0, comment: '已使用数量' })
  usedCount: number;
}
