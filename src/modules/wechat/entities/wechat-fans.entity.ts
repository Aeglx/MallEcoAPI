import { Entity, Column, Index } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_fans')
@Index(['openid'])
@Index(['subscribeStatus'])
export class WechatFans extends BaseWechatEntity {
  @Column({ length: 50, comment: 'openid' })
  openid: string;

  @Column({ length: 100, comment: 'unionid' })
  unionid: string;

  @Column({ length: 100, nullable: true, comment: '昵称' })
  nickname: string;

  @Column({ type: 'tinyint', default: 1, comment: '性别：0-未知，1-男，2-女' })
  sex: number;

  @Column({ length: 200, nullable: true, comment: '城市' })
  city: string;

  @Column({ length: 200, nullable: true, comment: '省份' })
  province: string;

  @Column({ length: 50, nullable: true, comment: '国家' })
  country: string;

  @Column({ length: 500, nullable: true, comment: '头像URL' })
  headimgurl: string;

  @Column({ type: 'tinyint', default: 0, comment: '关注状态：0-未关注，1-已关注' })
  subscribeStatus: number;

  @Column({ type: 'datetime', nullable: true, comment: '关注时间' })
  subscribeTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '取消关注时间' })
  unsubscribeTime: Date;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @Column({ type: 'json', nullable: true, comment: '标签ID列表' })
  tagIds: number[];

  @Column({ type: 'tinyint', default: 0, comment: '黑名单状态：0-正常，1-黑名单' })
  blacklist: number;

  @Column({ type: 'text', nullable: true, comment: '扩展信息' })
  extraInfo: string;

  @Column({ length: 50, nullable: true, comment: '扫码场景值' })
  qrScene: string;

  @Column({ length: 100, nullable: true, comment: '扫码场景描述' })
  qrSceneStr: string;

  @Column({ type: 'int', default: 0, comment: '互动次数' })
  interactionCount: number;

  @Column({ type: 'datetime', nullable: true, comment: '最后互动时间' })
  lastInteractionTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '用户积分' })
  points: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '用户余额' })
  balance: number;
}