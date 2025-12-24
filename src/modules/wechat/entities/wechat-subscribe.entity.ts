import { Entity, Column, Index } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_subscribe')
@Index(['openid'])
@Index(['templateId'])
@Index(['status'])
export class WechatSubscribe extends BaseWechatEntity {
  @Column({ length: 50, comment: '用户openid' })
  openid: string;

  @Column({ length: 100, comment: '模板ID' })
  templateId: string;

  @Column({ length: 100, nullable: true, comment: '场景' })
  scene: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-已订阅，2-拒收，3-已发送' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '订阅内容' })
  content: string;

  @Column({ type: 'json', nullable: true, comment: '模板数据' })
  templateData: any;

  @Column({ type: 'datetime', nullable: true, comment: '发送时间' })
  sendTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '点击时间' })
  clickTime: Date;

  @Column({ type: 'text', nullable: true, comment: '点击跳转链接' })
  clickUrl: string;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @Column({ type: 'tinyint', default: 0, comment: '重试次数' })
  retryCount: number;

  @Column({ type: 'datetime', nullable: true, comment: '下次重试时间' })
  nextRetryTime: Date;

  @Column({ type: 'text', nullable: true, comment: '错误信息' })
  errorMessage: string;

  @Column({ length: 50, nullable: true, comment: '关联业务ID' })
  businessId: string;

  @Column({ length: 50, nullable: true, comment: '关联业务类型' })
  businessType: string;
}