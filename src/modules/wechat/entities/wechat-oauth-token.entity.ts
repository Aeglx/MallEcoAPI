import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_oauth_token')
export class WechatOauthToken extends BaseWechatEntity {
  @Column({ length: 100, comment: '用户openid' })
  openid: string;

  @Column({ length: 100, comment: '应用ID' })
  appId: string;

  @Column({ length: 500, comment: '访问令牌' })
  accessToken: string;

  @Column({ length: 500, nullable: true, comment: '刷新令牌' })
  refreshToken: string;

  @Column({ type: 'int', comment: '令牌有效期(秒)' })
  expiresIn: number;

  @Column({ type: 'datetime', comment: '令牌创建时间' })
  createTime: Date;

  @Column({ type: 'datetime', comment: '令牌过期时间' })
  expireTime: Date;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-有效，0-无效' })
  status: number;

  @Column({ type: 'datetime', nullable: true, comment: '最后使用时间' })
  lastUsedTime: Date;

  @Column({ type: 'int', default: 0, comment: '使用次数' })
  usageCount: number;
}
