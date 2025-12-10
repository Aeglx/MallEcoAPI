import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { ArticleCategory } from './article-category.entity';
import { ArticleTag } from './article-tag.entity';
import { ArticleComment } from './article-comment.entity';

export enum ArticleStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  ARCHIVED = 'archived'
}

export enum ArticleType {
  NEWS = 'news',
  GUIDE = 'guide',
  TUTORIAL = 'tutorial',
  REVIEW = 'review',
  PROMOTION = 'promotion'
}

@Entity('cms_articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'longtext' })
  content: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  coverImage: string;

  @Column({ type: 'enum', enum: ArticleStatus, default: ArticleStatus.DRAFT })
  status: ArticleStatus;

  @Column({ type: 'enum', enum: ArticleType, default: ArticleType.NEWS })
  type: ArticleType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  author: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  source: string;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @Column({ type: 'int', default: 0 })
  commentCount: number;

  @Column({ type: 'int', default: 0 })
  shareCount: number;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'boolean', default: true })
  allowComments: boolean;

  @Column({ type: 'datetime', nullable: true })
  publishTime: Date;

  @Column({ type: 'datetime', nullable: true })
  scheduledPublishTime: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  seoTitle: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  seoKeywords: string;

  @Column({ type: 'text', nullable: true })
  seoDescription: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  slug: string;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @ManyToOne(() => ArticleCategory, category => category.articles)
  @JoinColumn({ name: 'categoryId' })
  category: ArticleCategory;

  @Column({ type: 'uuid', nullable: true })
  categoryId: string;

  @ManyToMany(() => ArticleTag, tag => tag.articles)
  @JoinTable({
    name: 'cms_article_tags',
    joinColumn: { name: 'articleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' }
  })
  tags: ArticleTag[];

  @OneToMany(() => ArticleComment, comment => comment.article)
  comments: ArticleComment[];

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'datetime', nullable: true })
  deleteTime: Date;
}