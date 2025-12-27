import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { SocialAuthEntity } from '../../../social/entities/social-auth.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

@Entity('mall_user')
@Index(['username'])
@Index(['email'])
@Index(['phone'])
@Index(['nickname'])
export class User extends BaseEntity {
  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 100, nullable: true })
  password: string;

  @Column({ length: 50, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 50, nullable: true })
  nickname: string;

  @Column({ length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ nullable: true })
  last_login_time: Date;

  @Column({ nullable: true })
  last_login_ip: string;

  @Column({ length: 20, nullable: true })
  gender: string;

  @Column({ nullable: true })
  birthday: Date;

  @Column({ length: 100, nullable: true })
  location: string;

  @Column({ name: 'is_vip', default: 0 })
  isVip: number;

  @Column({ name: 'vip_expire_time', nullable: true })
  vipExpireTime: Date;

  @Column({ name: 'points', default: 0 })
  points: number;

  @Column({ name: 'balance', type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  // 关联社交账号
  @OneToMany(() => SocialAuthEntity, socialAuth => socialAuth.user)
  social_auths: SocialAuthEntity[];
}
