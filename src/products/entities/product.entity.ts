import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('mall_product')
@Index(['name'])
@Index(['categoryId'])
@Index(['brandId'])
@Index(['isShow'])
@Index(['isNew'])
@Index(['isHot'])
@Index(['price'])
@Index(['recommend'])
@Index(['categoryId', 'isShow', 'sortOrder'])
@Index(['isShow', 'sortOrder', 'createdAt'])
@Index(['name', 'isShow'], { fulltext: true })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })  // 商品名称
  name: string;

  @Column({ length: 500, nullable: true })  // 商品描述
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })  // 商品价格
  price: number;

  @Column({ name: 'original_price', type: 'decimal', precision: 10, scale: 2, nullable: true })  // 原价
  originalPrice: number;

  @Column()  // 库存数量
  stock: number;

  @Column()  // 销量
  sales: number;

  @Column({ name: 'main_image', length: 255, nullable: true })  // 主图
  mainImage: string;

  @Column({ name: 'category_id', length: 36 })  // 分类ID
  categoryId: string;

  @Column({ name: 'brand_id', length: 36, nullable: true })  // 品牌ID
  brandId: string;

  @Column({ name: 'is_show', default: 1 })  // 是否上架(0:下架, 1:上架)
  isShow: number;

  @Column({ name: 'is_new', default: 0 })  // 是否新品(0:否, 1:是)
  isNew: number;

  @Column({ name: 'is_hot', default: 0 })  // 是否热门(0:否, 1:是)
  isHot: number;

  @Column({ name: 'recommend', default: 0 })  // 是否推荐(0:否, 1:是)
  recommend: number;

  @Column({ name: 'sort_order', default: 0 })  // 排序
  sortOrder: number;

  @Column({ name: 'specifications', type: 'json', nullable: true })  // 规格参数(JSON格式)
  specifications: any;

  @Column({ name: 'details', type: 'text', nullable: true })  // 商品详情
  details: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
