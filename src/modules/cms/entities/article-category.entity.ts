import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Tree, TreeChildren, TreeParent } from 'typeorm';
import { Article } from './article.entity';

@Entity('cms_categories')
@Tree('nested-set')
export class ArticleCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  slug: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  coverImage: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: true })
  showInNav: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  seoTitle: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  seoKeywords: string;

  @Column({ type: 'text', nullable: true })
  seoDescription: string;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @OneToMany(() => Article, article => article.category)
  articles: Article[];

  @TreeChildren()
  children: ArticleCategory[];

  @TreeParent()
  parent: ArticleCategory;

  @Column({ type: 'uuid', nullable: true })
  parentId: string;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'datetime', nullable: true })
  deleteTime: Date;
}