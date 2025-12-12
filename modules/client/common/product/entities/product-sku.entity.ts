import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../../common/base.entity';
import { Product } from './product.entity';

@Entity('mall_product_sku')
@Index(['productId'])
@Index(['skuCode'])
export class ProductSku extends BaseEntity {
  @Column({ length: 32, name: 'product_id' })
  productId: string;

  @Column({ length: 30, name: 'sku_code' })
  skuCode: string;

  @Column('json', { name: 'spec_values' })
  specValues: Record<string, string>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'original_price' })
  originalPrice: number;

  @Column()
  stock: number;

  @Column({ name: 'sales', default: 0 })
  sales: number;

  @Column({ length: 255, nullable: true, name: 'image_url' })
  imageUrl: string;

  // 鍏宠仈鍟嗗搧
  @ManyToOne(() => Product, (product) => product.skus, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}





