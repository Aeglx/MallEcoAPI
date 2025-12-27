import { Entity, Column, Index } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_template')
@Index(['templateId'])
@Index(['status'])
export class WechatTemplate extends BaseWechatEntity {
  @Column({ length: 100, comment: '模板ID' })
  templateId: string;

  @Column({ length: 200, comment: '模板标题' })
  title: string;

  @Column({ type: 'text', comment: '模板内容' })
  content: string;

  @Column({ length: 100, nullable: true, comment: '模板示例' })
  example: string;

  @Column({ type: 'json', nullable: true, comment: '模板参数' })
  params: any[];

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @Column({ type: 'tinyint', default: 2, comment: '模板类型：1-营销，2-通知' })
  type: number;

  @Column({ length: 100, nullable: true, comment: '分类' })
  category: string;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;

  @Column({ type: 'int', default: 0, comment: '发送次数' })
  sendCount: number;

  @Column({ type: 'int', default: 0, comment: '点击次数' })
  clickCount: number;

  @Column({ type: 'datetime', nullable: true, comment: '最后发送时间' })
  lastSendTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '最后点击时间' })
  lastClickTime: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, comment: '点击率' })
  clickRate: number;

  @Column({ length: 200, nullable: true, comment: '跳转URL' })
  url: string;

  @Column({ length: 100, nullable: true, comment: '小程序appid' })
  miniprogramAppid: string;

  @Column({ length: 200, nullable: true, comment: '小程序路径' })
  miniprogramPath: string;

  @Column({ type: 'datetime', nullable: true, comment: '过期时间' })
  expireTime: Date;
}
