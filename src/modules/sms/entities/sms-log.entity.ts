import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('mall_sms_log', { comment: '短信日志表' })
export class SmsLog {
  @PrimaryGeneratedColumn('uuid', { name: 'id', comment: '日志ID' })
  id: string;

  @Column({ name: 'mobile', type: 'varchar', length: 20, nullable: false, comment: '手机号' })
  mobile: string;

  @Column({ name: 'template_code', type: 'varchar', length: 50, nullable: false, comment: '模板代码' })
  templateCode: string;

  @Column({ name: 'template_param', type: 'json', nullable: true, comment: '模板参数(JSON格式)' })
  templateParam: Record<string, any>;

  @Column({ name: 'content', type: 'varchar', length: 200, nullable: true, comment: '短信内容' })
  content: string;

  @Column({ name: 'sms_type', type: 'tinyint', nullable: false, comment: '短信类型: 1-验证码 2-通知 3-营销' })
  smsType: number;

  @Column({ name: 'business_type', type: 'varchar', length: 50, nullable: false, comment: '业务类型' })
  businessType: string;

  @Column({ name: 'business_id', type: 'varchar', length: 36, nullable: true, comment: '业务ID' })
  businessId: string;

  @Column({ name: 'status', type: 'tinyint', nullable: false, default: 0, comment: '发送状态: 0-失败 1-成功' })
  status: number;

  @Column({ name: 'error_msg', type: 'varchar', length: 200, nullable: true, comment: '错误信息' })
  errorMsg: string;

  @Column({ name: 'request_id', type: 'varchar', length: 100, nullable: true, comment: '请求ID' })
  requestId: string;

  @Column({ name: 'send_time', type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP', comment: '发送时间' })
  sendTime: Date;

  @CreateDateColumn({ name: 'create_time', type: 'datetime', nullable: false, comment: '创建时间' })
  createTime: Date;
}
