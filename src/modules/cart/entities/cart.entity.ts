import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('mall_cart')
@Index(['userId', 'productId'], { unique: true })
export class Cart extends BaseEntity {
  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @Column({ name: 'product_id', nullable: false })
  productId: string;

  @Column({ nullable: false, default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, default: 0 })
  discount: number;

  @Column({ length: 255, nullable: true })
  product_name: string;

  @Column({ length: 255, nullable: true })
  product_image: string;

  @Column({ type: 'json', nullable: true })
  product_attributes: Record<string, any>;

  @Column({ name: 'selected', type: 'tinyint', default: 1 })
  selected: number;

  // 注意：由于使用内存存储，暂时不添加实体关�?
}

