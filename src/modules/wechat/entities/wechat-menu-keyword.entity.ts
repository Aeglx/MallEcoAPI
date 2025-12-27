import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_menu_keyword')
export class WechatMenuKeyword extends BaseWechatEntity {
  @Column({ length: 100, comment: '关键词' })
  keyword: string;

  @Column({ length: 200, comment: '关键词名称' })
  name: string;

  @Column({ type: 'text', comment: '回复内容' })
  content: string;

  @Column({ length: 50, comment: '匹配模式：exact-精确匹配，fuzzy-模糊匹配' })
  matchMode: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @Column({ type: 'int', default: 0, comment: '使用次数' })
  usageCount: number;

  @Column({ type: 'datetime', nullable: true, comment: '最后使用时间' })
  lastUsedTime: Date;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
