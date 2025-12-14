import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../../../common/base.entity';
import { Article } from './article.entity';

@Entity('mall_tag')
export class Tag extends BaseEntity {
  @Column({ name: 'tag_name', length: 50, nullable: false, unique: true, comment: '标签名称' })
  tagName: string;

  @Column({ name: 'slug', length: 100, nullable: true, comment: '标签别名' })
  slug: string;

  @Column({ name: 'description', type: 'text', nullable: true, comment: '标签描述' })
  description: string;

  @Column({ name: 'article_count', type: 'int', default: 0, comment: '使用次数' })
  articleCount: number;

  @ManyToMany(() => Article, article => article.tags)
  articles: Article[];
}
