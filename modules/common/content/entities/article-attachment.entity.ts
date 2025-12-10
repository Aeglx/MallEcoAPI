import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Article } from './article.entity';

@Entity('article_attachment')
export class ArticleAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  fileName: string;

  @Column({ length: 200 })
  filePath: string;

  @Column({ length: 100 })
  fileType: string;

  @Column({ default: 0 })
  fileSize: number;

  @Column({ length: 200, nullable: true })
  thumbnailPath: string;

  @Column({ default: 0 })
  downloadCount: number;

  @Column({ nullable: true })
  articleId: number;

  @ManyToOne(() => Article, article => article.attachments)
  article: Article;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}