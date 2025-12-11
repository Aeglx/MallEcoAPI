import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany, Tree, TreeParent, TreeChildren } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('mall_goods_category')
@Tree('closure-table')
@Index(['name'])
@Index(['parentId'])
@Index(['level'])
@Index(['sortOrder'])
@Index(['isShow'])
@Index(['createTime'])
export class GoodsCategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: '分类ID' })
  id: string;

  @Column({ name: 'parent_id', length: 36, nullable: true, comment: '父分类ID' })
  @ApiProperty({ description: '父分类ID' })
  parentId: string;

  @Column({ length: 100, comment: '分类名称' })
  @ApiProperty({ description: '分类名称' })
  name: string;

  @Column({ default: 1, comment: '分类层级' })
  @ApiProperty({ description: '分类层级' })
  level: number;

  @Column({ name: 'sort_order', default: 0, comment: '排序值' })
  @ApiProperty({ description: '排序值' })
  sortOrder: number;

  @Column({ length: 500, nullable: true, comment: '分类图片' })
  @ApiProperty({ description: '分类图片' })
  image: string;

  @Column({ length: 200, nullable: true, comment: '关键词' })
  @ApiProperty({ description: '关键词' })
  keywords: string;

  @Column({ length: 500, nullable: true, comment: '分类描述' })
  @ApiProperty({ description: '分类描述' })
  description: string;

  @Column({ name: 'is_show', default: 1, comment: '是否显示' })
  @ApiProperty({ description: '是否显示' })
  isShow: number;

  @Column({ name: 'is_recommend', default: 0, comment: '是否推荐' })
  @ApiProperty({ description: '是否推荐' })
  isRecommend: number;

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '佣金比例' })
  @ApiProperty({ description: '佣金比例' })
  commissionRate: number;

  @Column({ name: 'seo_title', length: 200, nullable: true, comment: 'SEO标题' })
  @ApiProperty({ description: 'SEO标题' })
  seoTitle: string;

  @Column({ name: 'seo_keywords', length: 200, nullable: true, comment: 'SEO关键词' })
  @ApiProperty({ description: 'SEO关键词' })
  seoKeywords: string;

  @Column({ name: 'seo_description', length: 500, nullable: true, comment: 'SEO描述' })
  @ApiProperty({ description: 'SEO描述' })
  seoDescription: string;

  @Column({ name: 'goods_count', default: 0, comment: '商品数量' })
  @ApiProperty({ description: '商品数量' })
  goodsCount: number;

  @CreateDateColumn({ name: 'create_time', type: 'datetime', comment: '创建时间' })
  @ApiProperty({ description: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', type: 'datetime', comment: '更新时间' })
  @ApiProperty({ description: '更新时间' })
  updateTime: Date;

  @Column({ name: 'create_by', length: 36, nullable: true, comment: '创建人' })
  @ApiProperty({ description: '创建人' })
  createBy: string;

  @Column({ name: 'update_by', length: 36, nullable: true, comment: '更新人' })
  @ApiProperty({ description: '更新人' })
  updateBy: string;

  @Column({ name: 'is_del', default: 0, comment: '删除标志' })
  @ApiProperty({ description: '删除标志' })
  isDel: number;

  // 树形结构关系
  @TreeParent()
  parent: GoodsCategoryEntity;

  @TreeChildren()
  children: GoodsCategoryEntity[];

  // 关联商品数量（虚拟字段，通过查询获取）
  productCount?: number;
}