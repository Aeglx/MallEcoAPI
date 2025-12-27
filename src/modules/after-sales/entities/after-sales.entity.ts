import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';

export enum AfterSalesType {
  REFUND = 'refund',
  RETURN = 'return',
  EXCHANGE = 'exchange',
}

export enum AfterSalesStatus {
  APPLIED = 'applied',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('mall_after_sales')
export class AfterSales {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: AfterSalesType })
  type: AfterSalesType;

  @Column({ type: 'enum', enum: AfterSalesStatus, default: AfterSalesStatus.APPLIED })
  status: AfterSalesStatus;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'product_sku_id' })
  productSkuId: number;

  @Column({ name: 'product_name' })
  productName: string;

  @Column({ name: 'product_sku_name' })
  productSkuName: string;

  @Column({ name: 'product_price', type: 'decimal', precision: 10, scale: 2 })
  productPrice: number;

  @Column({ name: 'quantity' })
  quantity: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundAmount: number;

  @Column({ name: 'reason', type: 'text' })
  reason: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'evidence_images', type: 'simple-array', nullable: true })
  evidenceImages?: string[];

  @Column({ name: 'review_reason', type: 'text', nullable: true })
  reviewReason?: string;

  @Column({ name: 'shipping_company', nullable: true })
  shippingCompany?: string;

  @Column({ name: 'tracking_number', nullable: true })
  trackingNumber?: string;

  @Column({ name: 'admin_id', nullable: true })
  adminId?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
