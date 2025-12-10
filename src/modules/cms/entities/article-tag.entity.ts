import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { Article } from './article.entity';

@Entity('cms_tags')
export class ArticleTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  slug: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  icon: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string;

  @Column({ type: 'int', default: 0 })
  articleCount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @ManyToMany(() => Article, article => article.tags)
  articles: Article[];

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'datetime', nullable: true })
  deleteTime: Date;
}