import { Entity, Column, Index, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../../common/base.entity';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { ProductSku } from './product-sku.entity';
import { Store } from '../../store/entities/store.entity';

@Entity('mall_product')
@Index(['name'])
@Index(['categoryId'])
@Index(['brandId'])
@Index(['storeId'])
@Index(['isShow'])
@Index(['isDel'])
export class Product extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ length: 32 })
  categoryId: string;

  @Column({ length: 32, nullable: true })
  brandId: string;

  @Column({ length: 32 })
  storeId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'original_price' })
  originalPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'commission_rate', nullable: true })
  commissionRate: number;

  @Column({ length: 255, nullable: true })
  keywords: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column('text', { nullable: true })
  content: string;

  @Column({ length: 255, nullable: true, name: 'main_image' })
  mainImage: string;

  @Column('json', { nullable: true, name: 'gallery_images' })
  galleryImages: string[];

  @Column({ name: 'is_show' })
  isShow: number;

  @Column({ name: 'is_new' })
  isNew: number;

  @Column({ name: 'is_hot' })
  isHot: number;

  @Column({ name: 'is_recommend' })
  isRecommend: number;

  @Column({ name: 'stock', default: 0 })
  stock: number;

  @Column({ name: 'sales', default: 0 })
  sales: number;

  @Column({ name: 'review_count', default: 0 })
  reviewCount: number;

  @Column({ name: 'score', type: 'decimal', precision: 3, scale: 2, default: 5 })
  score: number;

  // 鍏宠仈鍏崇郴
  @ManyToOne(() => Category, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  // 鍝佺墝
  @ManyToOne(() => Brand, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @OneToMany(() => ProductSku, (sku) => sku.product)
  skus: ProductSku[];

  @ManyToOne(() => Store, (store) => store.products, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'store_id' })
  store: Store;
}





