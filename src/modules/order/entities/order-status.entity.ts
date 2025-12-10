import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('order_status')
export class OrderStatusEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  orderSn: string;

  @Column({ length: 50 })
  memberId: string;

  @Column({ type: 'enum', enum: ['UNPAID', 'PAID', 'DELIVERED', 'COMPLETED', 'CANCELLED'], default: 'UNPAID' })
  orderStatus: string;

  @Column({ type: 'enum', enum: ['UNPAID', 'PAID', 'DELIVERED', 'COMPLETED', 'CANCELLED'], default: 'UNPAID' })
  paymentStatus: string;

  @Column({ type: 'enum', enum: ['UNSHIPPED', 'SHIPPED', 'RECEIVED'], default: 'UNSHIPPED' })
  shippingStatus: string;

  @Column({ type: 'text', nullable: true })
  statusDescription: string;

  @Column({ length: 50, nullable: true })
  operatorId: string;

  @Column({ length: 100, nullable: true })
  operatorName: string;

  @Column({ length: 50, nullable: true })
  ip: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ type: 'jsonb', nullable: true })
  extra: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}