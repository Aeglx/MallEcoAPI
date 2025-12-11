import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { GoodsSkuEntity } from './goods-sku.entity';
import { GoodsCategoryEntity } from './goods-category.entity';

@Entity('mall_goods')
@Index(['name'])
@Index(['categoryId'])
@Index(['brandId'])
@Index(['isShow'])
@Index(['isHot'])
@Index(['isNew'])
@Index(['recommend'])
@Index(['price'])
@Index(['sales'])
@Index(['createTime'])
export class GoodsEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: '商品ID' })
  id: string;

  @Column({ length: 100, comment: '商品名称' })
  @ApiProperty({ description: '商品名称' })
  name: string;

  @Column({ length: 500, nullable: true, comment: '商品描述' })
  @ApiProperty({ description: '商品描述' })
  description: string;

  @Column({ length: 200, nullable: true, comment: '关键词' })
  @ApiProperty({ description: '关键词' })
  keywords: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, comment: '价格' })
  @ApiProperty({ description: '价格' })
  price: number;

  @Column({ name: 'original_price', type: 'decimal', precision: 12, scale: 2, nullable: true, comment: '原价' })
  @ApiProperty({ description: '原价' })
  originalPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, comment: '成本价' })
  @ApiProperty({ description: '成本价' })
  costPrice: number;

  @Column({ default: 0, comment: '库存数量' })
  @ApiProperty({ description: '库存数量' })
  stock: number;

  @Column({ default: 0, comment: '销量' })
  @ApiProperty({ description: '销量' })
  sales: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true, comment: '重量(kg)' })
  @ApiProperty({ description: '重量(kg)' })
  weight: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true, comment: '体积(m³)' })
  @ApiProperty({ description: '体积(m³)' })
  volume: number;

  @Column({ name: 'main_image', length: 500, nullable: true, comment: '主图' })
  @ApiProperty({ description: '主图' })
  mainImage: string;

  @Column({ name: 'image_list', type: 'json', nullable: true, comment: '图片列表' })
  @ApiProperty({ description: '图片列表' })
  imageList: string[];

  @Column({ name: 'category_id', length: 36, comment: '分类ID' })
  @ApiProperty({ description: '分类ID' })
  categoryId: string;

  @Column({ name: 'brand_id', length: 36, nullable: true, comment: '品牌ID' })
  @ApiProperty({ description: '品牌ID' })
  brandId: string;

  @Column({ name: 'is_show', default: 1, comment: '是否上架(0:下架, 1:上架)' })
  @ApiProperty({ description: '是否上架' })
  isShow: number;

  @Column({ name: 'is_hot', default: 0, comment: '是否热门(0:否, 1:是)' })
  @ApiProperty({ description: '是否热门' })
  isHot: number;

  @Column({ name: 'is_new', default: 0, comment: '是否新品(0:否, 1:是)' })
  @ApiProperty({ description: '是否新品' })
  isNew: number;

  @Column({ default: 0, comment: '是否推荐(0:否, 1:是)' })
  @ApiProperty({ description: '是否推荐' })
  recommend: number;

  @Column({ name: 'sort_order', default: 0, comment: '排序值' })
  @ApiProperty({ description: '排序值' })
  sortOrder: number;

  @Column({ type: 'json', nullable: true, comment: '规格参数(JSON格式)' })
  @ApiProperty({ description: '规格参数' })
  specifications: any;

  @Column({ type: 'text', nullable: true, comment: '商品详情' })
  @ApiProperty({ description: '商品详情' })
  details: string;

  @Column({ type: 'text', nullable: true, comment: '商品参数' })
  @ApiProperty({ description: '商品参数' })
  parameters: string;

  @Column({ name: 'service_guarantee', type: 'json', nullable: true, comment: '服务保障' })
  @ApiProperty({ description: '服务保障' })
  serviceGuarantee: any;

  @Column({ name: 'after_sale_service', type: 'text', nullable: true, comment: '售后服务' })
  @ApiProperty({ description: '售后服务' })
  afterSaleService: string;

  @Column({ name: 'virtual_sales', default: 0, comment: '虚拟销量' })
  @ApiProperty({ description: '虚拟销量' })
  virtualSales: number;

  @Column({ name: 'comment_count', default: 0, comment: '评论数量' })
  @ApiProperty({ description: '评论数量' })
  commentCount: number;

  @Column({ name: 'good_comment_rate', type: 'decimal', precision: 5, scale: 2, default: 100, comment: '好评率' })
  @ApiProperty({ description: '好评率' })
  goodCommentRate: number;

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

  // 关联关系
  @OneToMany(() => GoodsSkuEntity, sku => sku.goods)
  skus: GoodsSkuEntity[];

  // 分类关联（通过categoryId关联）
  category?: GoodsCategoryEntity;

  // 品牌关联（通过brandId关联）
  brand?: any; // 品牌实体类
}