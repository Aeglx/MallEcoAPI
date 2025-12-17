import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_material_article')
export class WechatMaterialArticle extends BaseWechatEntity {
  @Column({ length: 100, comment: '图文ID' })
  articleId: string;

  @Column({ length: 200, comment: '标题' })
  title: string;

  @Column({ type: 'text', comment: '内容' })
  content: string;

  @Column({ length: 500, nullable: true, comment: '封面图URL' })
  cover: string;

  @Column({ length: 500, nullable: true, comment: '原文链接' })
  sourceUrl: string;

  @Column({ type: 'text', nullable: true, comment: '摘要' })
  digest: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @Column({ type: 'int', default: 0, comment: '阅读次数' })
  readCount: number;

  @Column({ type: 'int', default: 0, comment: '分享次数' })
  shareCount: number;
}