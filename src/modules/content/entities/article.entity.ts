import { Entity, Column, ManyToOne, ManyToMany, JoinTable, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Category } from './category.entity';
import { Tag } from './tag.entity';

@Entity('mall_article')
export class Article extends BaseEntity {
  @Column({ name: 'title', length: 200, nullable: false, comment: '文章标题' })
  title: string;

  @Column({ name: 'sub_title', length: 200, nullable: true, comment: '文章副标题' })
  subTitle: string;

  @Column({ name: 'content', type: 'longtext', nullable: false, comment: '文章内容' })
  content: string;

  @Column({ name: 'summary', type: 'text', nullable: true, comment: '文章摘要' })
  summary: string;

  @Column({
    name: 'cover_image',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '封面图片',
  })
  coverImage: string;

  @Column({ name: 'author', length: 50, nullable: true, comment: '作者' })
  author: string;

  @Column({ name: 'view_count', type: 'int', default: 0, comment: '浏览量' })
  viewCount: number;

  @Column({ name: 'like_count', type: 'int', default: 0, comment: '点赞量' })
  likeCount: number;

  @Column({ name: 'comment_count', type: 'int', default: 0, comment: '评论量' })
  commentCount: number;

  @Column({
    name: 'status',
    type: 'tinyint',
    default: 0,
    comment: '状态：0-草稿，1-已发布，2-已下架',
  })
  status: number;

  @Column({ name: 'is_top', type: 'tinyint', default: 0, comment: '是否置顶' })
  isTop: number;

  @Column({ name: 'is_hot', type: 'tinyint', default: 0, comment: '是否热门' })
  isHot: number;

  @Column({ name: 'publish_time', type: 'datetime', nullable: true, comment: '发布时间' })
  publishTime: Date;

  @ManyToOne(() => Category, category => category.articles, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category;

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'mall_article_tag',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];
}
