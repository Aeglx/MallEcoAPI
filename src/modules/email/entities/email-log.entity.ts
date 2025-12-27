import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('mall_email_log', { comment: '邮件日志表' })
export class EmailLog {
  @PrimaryGeneratedColumn('uuid', { name: 'id', comment: '日志ID' })
  id: string;

  @Column({
    name: 'to_email',
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: '收件人邮箱',
  })
  toEmail: string;

  @Column({ name: 'subject', type: 'varchar', length: 200, nullable: false, comment: '邮件主题' })
  subject: string;

  @Column({ name: 'content', type: 'text', nullable: true, comment: '邮件内容' })
  content: string;

  @Column({
    name: 'email_type',
    type: 'tinyint',
    nullable: false,
    comment: '邮件类型: 1-验证码 2-通知 3-营销',
  })
  emailType: number;

  @Column({
    name: 'business_type',
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: '业务类型',
  })
  businessType: string;

  @Column({ name: 'business_id', type: 'varchar', length: 36, nullable: true, comment: '业务ID' })
  businessId: string;

  @Column({
    name: 'status',
    type: 'tinyint',
    nullable: false,
    default: 0,
    comment: '发送状态: 0-失败 1-成功',
  })
  status: number;

  @Column({ name: 'error_msg', type: 'varchar', length: 200, nullable: true, comment: '错误信息' })
  errorMsg: string;

  @Column({
    name: 'send_time',
    type: 'datetime',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    comment: '发送时间',
  })
  sendTime: Date;

  @CreateDateColumn({ name: 'create_time', type: 'datetime', nullable: false, comment: '创建时间' })
  createTime: Date;
}
