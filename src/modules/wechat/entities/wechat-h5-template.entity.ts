import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_h5_template')
export class WechatH5Template extends BaseWechatEntity {
  @Column({ length: 200, comment: '模板名称' })
  name: string;

  @Column({ type: 'text', comment: '模板内容' })
  content: string;

  @Column({ length: 100, nullable: true, comment: '模板描述' })
  description: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @Column({ length: 500, nullable: true, comment: '模板预览图' })
  preview: string;

  @Column({ type: 'json', nullable: true, comment: '模板配置' })
  config: any;

  @Column({ type: 'int', default: 0, comment: '使用次数' })
  usageCount: number;
}