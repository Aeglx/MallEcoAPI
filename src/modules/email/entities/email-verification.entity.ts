import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('mall_email_verification', { comment: '邮件验证码表' })
export class EmailVerification {
  @PrimaryGeneratedColumn('uuid', { name: 'id', comment: '验证码ID' })
  id: string;

  @Column({ name: 'email', type: 'varchar', length: 100, nullable: false, comment: '邮箱地址' })
  email: string;

  @Column({ name: 'code', type: 'varchar', length: 10, nullable: false, comment: '验证码' })
  code: string;

  @Column({ name: 'business_type', type: 'varchar', length: 50, nullable: false, comment: '业务类型' })
  businessType: string;

  @Column({ name: 'ip', type: 'varchar', length: 50, nullable: true, comment: '请求IP' })
  ip: string;

  @Column({ name: 'expire_time', type: 'datetime', nullable: false, comment: '过期时间' })
  expireTime: Date;

  @Column({ name: 'used', type: 'tinyint', nullable: false, default: 0, comment: '是否使用: 0-未使用 1-已使用' })
  used: number;

  @CreateDateColumn({ name: 'create_time', type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP', comment: '创建时间' })
  createTime: Date;
}
