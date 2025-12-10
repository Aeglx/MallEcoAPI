import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderItemEntity } from './order-item.entity';
import { OrderLogEntity } from './order-log.entity';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 32, unique: true })
  orderSn: string;

  @Column({ length: 50 })
  memberId: string;

  @Column({ length: 50 })
  storeId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  payPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  freightPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountPrice: number;

  @Column({ length: 100, nullable: true })
  paymentMethod: string;

  @Column({ length: 100, nullable: true })
  paymentName: string;

  @Column({ type: 'enum', enum: ['UNPAID', 'PAID', 'DELIVERED', 'COMPLETED', 'CANCELLED'], default: 'UNPAID' })
  orderStatus: string;

  @Column({ type: 'enum', enum: ['UNPAID', 'PAID', 'DELIVERED', 'COMPLETED', 'CANCELLED'], default: 'UNPAID' })
  paymentStatus: string;

  @Column({ type: 'enum', enum: ['UNSHIPPED', 'SHIPPED', 'RECEIVED'], default: 'UNSHIPPED' })
  shippingStatus: string;

  @Column({ length: 500, nullable: true })
  receiverName: string;

  @Column({ length: 20, nullable: true })
  receiverPhone: string;

  @Column({ length: 500, nullable: true })
  receiverAddress: string;

  @Column({ length: 10, nullable: true })
  receiverZipCode: string;

  @Column({ type: 'text', nullable: true })
  buyerMessage: string;

  @Column({ length: 100, nullable: true })
  shippingSn: string;

  @Column({ length: 100, nullable: true })
  shippingCompany: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  goodsAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  couponPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  integralPrice: number;

  @Column({ default: 0 })
  useIntegral: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  commission: number;

  @Column({ length: 50, nullable: true })
  distributorId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  distributionCommission: number;

  @Column({ nullable: true })
  payTime: Date;

  @Column({ nullable: true })
  shippingTime: Date;

  @Column({ nullable: true })
  receiveTime: Date;

  @Column({ nullable: true })
  finishTime: Date;

  @Column({ type: 'text', nullable: true })
  cancelReason: string;

  @Column({ nullable: true })
  cancelTime: Date;

  @Column({ type: 'jsonb', nullable: true })
  extension: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  evaluateExtension: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OrderItemEntity, item => item.order)
  orderItems: OrderItemEntity[];

  @OneToMany(() => OrderLogEntity, log => log.order)
  orderLogs: OrderLogEntity[];
}