import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { ArticleCategory } from './article-category.entity';
import { ArticleTag } from './article-tag.entity';
import { ArticleComment } from './article-comment.entity';
import { ArticleAttachment } from './article-attachment.entity';

@Entity('article')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ length: 500, nullable: true })
  coverImage: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @Column({ default: 0 })
  shareCount: number;

  @Column({ type: 'enum', enum: ['draft', 'pending', 'published', 'rejected'], default: 'draft' })
  status: string;

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ default: true })
  allowComment: boolean;

  @Column({ default: false })
  isTop: boolean;

  @Column({ default: false })
  isRecommend: boolean;

  @Column({ default: false })
  isOriginal: boolean;

  @Column({ nullable: true })
  authorId: number;

  @Column({ length: 100, nullable: true })
  authorName: string;

  @Column({ length: 200, nullable: true })
  source: string;

  @Column({ length: 500, nullable: true })
  sourceUrl: string;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => ArticleCategory, category => category.articles)
  category: ArticleCategory;

  @ManyToMany(() => ArticleTag)
  @JoinTable({
    name: 'article_tag_relation',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' }
  })
  tags: ArticleTag[];

  @OneToMany(() => ArticleComment, comment => comment.article)
  comments: ArticleComment[];

  @OneToMany(() => ArticleAttachment, attachment => attachment.article)
  attachments: ArticleAttachment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}