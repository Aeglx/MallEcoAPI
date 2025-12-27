import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Live } from './live.entity';
import { Product } from '../../../products/entities/product.entity';

@Entity('mall_live_product')
export class LiveProduct extends BaseEntity {
  @ManyToOne(() => Live, live => live.id)
  live: Live;

  @ManyToOne(() => Product, product => product.id)
  product: Product;

  @Column({ name: 'live_id', length: 24, nullable: false, comment: '直播ID' })
  liveId: string;

  @Column({ name: 'product_id', length: 24, nullable: false, comment: '商品ID' })
  productId: string;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({
    name: 'live_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: '直播价格',
  })
  livePrice: number;

  @Column({
    name: 'original_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: '原价',
  })
  originalPrice: number;

  @Column({ name: 'stock', type: 'int', nullable: false, comment: '直播间库存' })
  stock: number;

  @Column({ name: 'sales_count', type: 'int', default: 0, comment: '直播间销量' })
  salesCount: number;

  @Column({ name: 'is_hot', type: 'int', default: 0, comment: '是否为直播热销' })
  isHot: number;
}
