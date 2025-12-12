import { Entity, Column, Index, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../../common/base.entity';

@Entity('mall_category')
@Index(['name'])
@Index(['parentId'])
@Index(['level'])
@Index(['isShow'])
export class Category extends BaseEntity {
  @Column({ length: 32, nullable: true })
  parentId: string;

  @Column({ length: 50 })
  name: string;

  @Column()
  level: number;

  @Column()
  sort: number;

  @Column({ length: 255, nullable: true })
  icon: string;

  @Column({ length: 255, nullable: true })
  image: string;

  @Column()
  isShow: number;

  // 鑷叧鑱斿瓙鍒嗙被
  @OneToMany(() => Category, (category) => category.parentCategory)
  @JoinColumn({ name: 'parentId' })
  children: Category[];

  @ManyToOne(() => Category, (category) => category.children, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'parentId' })
  parentCategory: Category;
}





