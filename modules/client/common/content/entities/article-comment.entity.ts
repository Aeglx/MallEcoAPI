import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Article } from './article.entity';

@Entity('article_comment')
export class ArticleComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  parentId: number;

  @Column({ nullable: true })
  userId: number;

  @Column({ length: 100, nullable: true })
  userName: string;

  @Column({ length: 200, nullable: true })
  userAvatar: string;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  status: string;

  @Column({ default: false })
  isTop: boolean;

  @Column({ nullable: true })
  articleId: number;

  @ManyToOne(() => Article, article => article.comments)
  article: Article;

  @OneToMany(() => ArticleComment, comment => comment.parentId)
  replies: ArticleComment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}