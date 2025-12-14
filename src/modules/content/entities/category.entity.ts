import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../common/base.entity';
import { Article } from './article.entity';

@Entity('mall_category')
export class Category extends BaseEntity {
  @Column({ name: 'category_name', length: 100, nullable: false, comment: '分类名称' })
  categoryName: string;

  @Column({ name: 'parent_id', length: 36, nullable: true, comment: '父分类ID' })
  parentId: string;

  @Column({ name: 'level', type: 'tinyint', default: 0, comment: '分类级别' })
  level: number;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({ name: 'status', type: 'tinyint', default: 0, comment: '状态：0-禁用，1-启用' })
  status: number;

  @OneToMany(() => Article, article => article.category)
  articles: Article[];
}
