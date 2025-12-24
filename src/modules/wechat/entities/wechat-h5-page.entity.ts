import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_h5_page')
export class WechatH5Page extends BaseWechatEntity {
  @Column({ length: 200, comment: '页面标题' })
  title: string;

  @Column({ type: 'text', comment: '页面内容' })
  content: string;

  @Column({ length: 100, nullable: true, comment: '页面描述' })
  description: string;

  @Column({ length: 500, nullable: true, comment: '页面封面' })
  cover: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @Column({ length: 500, nullable: true, comment: '页面URL' })
  url: string;

  @Column({ type: 'json', nullable: true, comment: '页面配置' })
  config: any;

  @Column({ type: 'int', default: 0, comment: '访问次数' })
  viewCount: number;

  @Column({ type: 'datetime', nullable: true, comment: '最后访问时间' })
  lastViewTime: Date;
}