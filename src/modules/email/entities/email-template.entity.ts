import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('mall_email_template', { comment: '邮件模板表' })
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid', { name: 'id', comment: '模板ID' })
  id: string;

  @Column({
    name: 'template_code',
    type: 'varchar',
    length: 50,
    nullable: false,
    unique: true,
    comment: '模板代码',
  })
  templateCode: string;

  @Column({
    name: 'template_name',
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: '模板名称',
  })
  templateName: string;

  @Column({ name: 'subject', type: 'varchar', length: 200, nullable: false, comment: '邮件主题' })
  subject: string;

  @Column({ name: 'template_content', type: 'text', nullable: false, comment: '模板内容' })
  templateContent: string;

  @Column({
    name: 'email_type',
    type: 'tinyint',
    nullable: false,
    comment: '邮件类型: 1-验证码 2-通知 3-营销',
  })
  emailType: number;

  @Column({
    name: 'status',
    type: 'tinyint',
    nullable: false,
    default: 1,
    comment: '状态: 0-禁用 1-启用',
  })
  status: number;

  @CreateDateColumn({ name: 'create_time', type: 'datetime', nullable: false, comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({
    name: 'update_time',
    type: 'datetime',
    nullable: false,
    onUpdate: 'CURRENT_TIMESTAMP',
    comment: '更新时间',
  })
  updateTime: Date;
}
