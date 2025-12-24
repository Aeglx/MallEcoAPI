import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';

export enum SocialPlatform {
  WECHAT = 'wechat',
  WECHAT_MP = 'wechat_mp',
  WECHAT_OPEN = 'wechat_open',
  QQ = 'qq',
  WEIBO = 'weibo',
  ALIPAY = 'alipay',
  APPLE = 'apple',
  GITHUB = 'github',
  GOOGLE = 'google',
}

export enum ClientType {
  PC = 'pc',
  H5 = 'h5',
  APP = 'app',
  MINI_PROGRAM = 'mini_program',
}

@Entity('social_auth')
export class SocialAuthEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @Column({ type: 'enum', enum: SocialPlatform })
  platform!: SocialPlatform;

  @Column({ type: 'enum', enum: ClientType })
  client_type!: ClientType;

  @Column()
  open_id!: string;

  @Column({ nullable: true })
  union_id!: string;

  @Column({ nullable: true })
  access_token!: string;

  @Column({ nullable: true })
  refresh_token!: string;

  @Column({ nullable: true })
  expires_in!: number;

  @Column({ nullable: true })
  scope!: string;

  @Column({ nullable: true })
  extra_data!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => User, (user) => user.social_auths)
  user!: User;
}
