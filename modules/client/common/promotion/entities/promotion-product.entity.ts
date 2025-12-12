import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../../common/base.entity';
import { Promotion } from './promotion.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('mall_promotion_product')
@Index(['promotionId', 'productId'], { unique: true })
@Index(['productId'])
@Index(['promotionId'])
export class PromotionProduct extends BaseEntity {
  @Column({ length: 32, name: 'promotion_id' })
  promotionId: string;

  @Column({ length: 32, name: 'product_id' })
  productId: string;

  @Column({ length: 32, name: 'sku_id', nullable: true })
  skuId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'promotion_price', nullable: true })
  promotionPrice: number;

  @Column({ type: 'int', name: 'stock', nullable: true })
  stock: number;

  @Column({ type: 'int', name: 'sales', default: 0 })
  sales: number;

  @Column({ type: 'boolean', name: 'is_main', default: false })
  isMain: boolean;

  // 鍏宠仈鍏崇郴
  @ManyToOne(() => Promotion, (promotion) => promotion.promotionProducts, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'promotion_id' })
  promotion: Promotion;

  @ManyToOne(() => Product, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}





