import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../../common/base.entity';

@Entity('mall_order_item')
@Index(['orderId'])  // 为订单ID创建索引，方便查询
@Index(['productId'])  // 为商品ID创建索引，方便查询
@Index(['orderId', 'productId'], { unique: true })  // 订单ID和商品ID的组合索引，确保订单中不会有重复商品

export class OrderItem extends BaseEntity {
  @Column({ name: 'order_id', nullable: false, comment: '订单ID' })
  orderId: string;

  @Column({ name: 'product_id', nullable: false, comment: '商品ID' })
  productId: number;

  @Column({ name: 'product_name', nullable: false, comment: '商品名称' })
  productName: string;

  @Column({ name: 'product_image', nullable: false, comment: '商品图片' })
  productImage: string;

  @Column({ name: 'product_sku', nullable: true, comment: '商品SKU' })
  productSku: string;

  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2, default: 0, comment: '商品单价' })
  price: number;

  @Column({ name: 'quantity', type: 'int', nullable: false, default: 1, comment: '商品数量' })
  quantity: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2, default: 0, comment: '商品总价' })
  totalPrice: number;

  @Column({ name: 'is_deleted', nullable: false, default: 0, comment: '是否删除：0-否，1-是' })
  isDeleted: number;
}
