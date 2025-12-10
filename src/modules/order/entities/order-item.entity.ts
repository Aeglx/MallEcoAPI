import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  orderId: string;

  @Column({ length: 100 })
  goodsId: string;

  @Column({ length: 100 })
  goodsName: string;

  @Column({ length: 100 })
  goodsImage: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  goodsPrice: number;

  @Column({ type: 'int', default: 1 })
  goodsNum: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  couponPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  integralPrice: number;

  @Column({ default: 0 })
  useIntegral: number;

  @Column({ length: 50, nullable: true })
  categoryId: string;

  @Column({ length: 100, nullable: true })
  categoryName: string;

  @Column({ type: 'text', nullable: true })
  goodsSpec: string;

  @Column({ length: 100, nullable: true })
  skuId: string;

  @Column({ type: 'text', nullable: true })
  skuName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  skuPrice: number;

  @Column({ type: 'int', nullable: true })
  skuStock: number;

  @Column({ length: 200, nullable: true })
  skuImage: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  commission: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  distributionCommission: number;

  @Column({ length: 50, nullable: true })
  distributorId: string;

  @Column({ type: 'jsonb', nullable: true })
  extension: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  evaluateExtension: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @ManyToOne(() => OrderEntity, order => order.orderItems)
  @JoinColumn({ name: 'orderId' })
  order: OrderEntity;
}