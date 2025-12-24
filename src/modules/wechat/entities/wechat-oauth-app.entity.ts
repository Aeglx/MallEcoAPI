import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_oauth_app')
export class WechatOauthApp extends BaseWechatEntity {
  @Column({ length: 100, comment: '应用ID' })
  appId: string;

  @Column({ length: 200, comment: '应用名称' })
  name: string;

  @Column({ length: 500, nullable: true, comment: '应用描述' })
  description: string;

  @Column({ length: 100, comment: '应用密钥' })
  appSecret: string;

  @Column({ length: 500, nullable: true, comment: '授权回调域' })
  redirectUri: string;

  @Column({ type: 'json', nullable: true, comment: '授权范围' })
  scopes: string[];

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @Column({ type: 'int', default: 0, comment: '授权用户数' })
  userCount: number;

  @Column({ type: 'datetime', nullable: true, comment: '最后授权时间' })
  lastAuthTime: Date;
}