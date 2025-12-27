import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('mall_sms_verification', { comment: '短信验证码表' })
export class SmsVerification {
  @PrimaryGeneratedColumn('uuid', { name: 'id', comment: '验证码ID' })
  id: string;

  @Column({ name: 'mobile', type: 'varchar', length: 20, nullable: false, comment: '手机号' })
  mobile: string;

  @Column({ name: 'code', type: 'varchar', length: 10, nullable: false, comment: '验证码' })
  code: string;

  @Column({
    name: 'business_type',
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: '业务类型',
  })
  businessType: string;

  @Column({ name: 'ip', type: 'varchar', length: 50, nullable: true, comment: '请求IP' })
  ip: string;

  @Column({ name: 'expire_time', type: 'datetime', nullable: false, comment: '过期时间' })
  expireTime: Date;

  @Column({
    name: 'used',
    type: 'tinyint',
    nullable: false,
    default: 0,
    comment: '是否使用: 0-未使用 1-已使用',
  })
  used: number;

  @Column({
    name: 'create_time',
    type: 'datetime',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    comment: '创建时间',
  })
  createTime: Date;
}
