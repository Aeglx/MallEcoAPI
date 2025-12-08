import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { MemberAddress } from './member-address.entity';
import { MemberPoints } from './member-points.entity';

// 会员状态枚举
export enum MemberStatus {
  ACTIVE = 'active', // 活跃
  INACTIVE = 'inactive', // 非活跃
  SUSPENDED = 'suspended', // 已暂停
  CANCELED = 'canceled', // 已取消
}

// 会员等级枚举
export enum MemberLevel {
  LEVEL_1 = 'level_1', // 普通会员
  LEVEL_2 = 'level_2', // 银卡会员
  LEVEL_3 = 'level_3', // 金卡会员
  LEVEL_4 = 'level_4', // 铂金会员
  LEVEL_5 = 'level_5', // 钻石会员
}

// 会员性别枚举
export enum MemberGender {
  MALE = 'male', // 男
  FEMALE = 'female', // 女
  OTHER = 'other', // 其他
}

@Entity('mall_members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true, comment: '会员账号' })
  account: string;

  @Column({ length: 100, select: false, comment: '会员密码' })
  password: string;

  @Column({ length: 50, nullable: true, comment: '会员昵称' })
  nickname: string;

  @Column({ length: 100, nullable: true, comment: '会员头像' })
  avatar: string;

  @Column({ length: 20, nullable: true, unique: true, comment: '手机号码' })
  phone: string;

  @Column({ length: 100, nullable: true, unique: true, comment: '电子邮箱' })
  email: string;

  @Column({ type: 'enum', enum: MemberGender, nullable: true, comment: '性别' })
  gender: MemberGender;

  @Column({ type: 'date', nullable: true, comment: '出生日期' })
  birthday: Date;

  @Column({ length: 200, nullable: true, comment: '会员简介' })
  introduction: string;

  @Column({ type: 'enum', enum: MemberStatus, default: MemberStatus.ACTIVE, comment: '会员状态' })
  status: MemberStatus;

  @Column({ type: 'enum', enum: MemberLevel, default: MemberLevel.LEVEL_1, comment: '会员等级' })
  level: MemberLevel;

  @Column({ type: 'int', default: 0, comment: '积分' })
  points: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '余额' })
  balance: number;

  @Column({ type: 'int', default: 0, comment: '成长值' })
  growthValue: number;

  @Column({ type: 'timestamp', nullable: true, comment: '最后登录时间' })
  lastLoginTime: Date;

  @Column({ length: 100, nullable: true, comment: '最后登录IP' })
  lastLoginIp: string;

  @Column({ type: 'int', default: 0, comment: '登录次数' })
  loginCount: number;

  @Column({ length: 100, nullable: true, comment: '微信openid' })
  wechatOpenid: string;

  @Column({ length: 100, nullable: true, comment: 'QQ openid' })
  qqOpenid: string;

  @Column({ length: 100, nullable: true, comment: '微博openid' })
  weiboOpenid: string;

  @Column({ nullable: true, comment: '会员来源' })
  source: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ comment: '删除时间' })
  deletedAt: Date;

  // 关联会员地址
  @OneToMany(() => MemberAddress, address => address.member)
  addresses: MemberAddress[];

  // 关联会员积分记录
  @OneToMany(() => MemberPoints, points => points.member)
  pointsRecords: MemberPoints[];
}
