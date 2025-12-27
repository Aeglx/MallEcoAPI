import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_oauth_user')
export class WechatOauthUser extends BaseWechatEntity {
  @Column({ length: 100, comment: '用户openid' })
  openid: string;

  @Column({ length: 100, nullable: true, comment: '用户unionid' })
  unionid: string;

  @Column({ length: 200, nullable: true, comment: '用户昵称' })
  nickname: string;

  @Column({ length: 500, nullable: true, comment: '头像URL' })
  headimgurl: string;

  @Column({ type: 'tinyint', default: 1, comment: '性别：0-未知，1-男，2-女' })
  sex: number;

  @Column({ length: 100, comment: '应用ID' })
  appId: string;

  @Column({ type: 'text', nullable: true, comment: '用户信息' })
  userInfo: string;

  @Column({ type: 'datetime', comment: '授权时间' })
  authTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '最后访问时间' })
  lastAccessTime: Date;

  @Column({ type: 'int', default: 0, comment: '访问次数' })
  accessCount: number;
}
