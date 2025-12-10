import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Tree, TreeChildren, TreeParent } from 'typeorm';
import { Article } from './article.entity';

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SPAM = 'spam'
}

@Entity('cms_comments')
@Tree('nested-set')
export class ArticleComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 100 })
  author: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  website: string;

  @Column({ type: 'enum', enum: CommentStatus, default: CommentStatus.PENDING })
  status: CommentStatus;

  @Column({ type: 'varchar', length: 15, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @Column({ type: 'int', default: 0 })
  dislikeCount: number;

  @Column({ type: 'boolean', default: false })
  isAdmin: boolean;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @ManyToOne(() => Article, article => article.comments)
  @JoinColumn({ name: 'articleId' })
  article: Article;

  @Column({ type: 'uuid' })
  articleId: string;

  @TreeChildren()
  replies: ArticleComment[];

  @TreeParent()
  parent: ArticleComment;

  @Column({ type: 'uuid', nullable: true })
  parentId: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'datetime', nullable: true })
  deleteTime: Date;
}