import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../../common/base.entity';
import { Order } from './order.entity';

@Entity('mall_order_item')
@Index(['orderId'])
@Index(['productId'])
@Index(['skuId'])
export class OrderItem extends BaseEntity {
  @Column({ length: 32, name: 'order_id' })
  orderId: string;

  @Column({ length: 32, name: 'product_id' })
  productId: string;

  @Column({ length: 32, name: 'sku_id' })
  skuId: string;

  @Column({ length: 100, name: 'product_name' })
  productName: string;

  @Column({ length: 255, name: 'product_image' })
  productImage: string;

  @Column('json', { name: 'sku_spec' })
  skuSpec: Record<string, string>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_price' })
  totalPrice: number;

  // 鍏宠仈鍏崇郴
  @ManyToOne(() => Order, (order) => order.orderItems, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}





