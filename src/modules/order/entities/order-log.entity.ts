import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_logs')
export class OrderLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  orderId: string;

  @Column({ length: 50, nullable: true })
  memberId: string;

  @Column({ length: 50, nullable: true })
  operatorId: string;

  @Column({ length: 100, nullable: true })
  operatorName: string;

  @Column({ length: 50 })
  logType: string;

  @Column({ length: 50 })
  logModule: string;

  @Column({ type: 'text' })
  logContent: string;

  @Column({ type: 'enum', enum: ['ORDER_CREATE', 'ORDER_PAY', 'ORDER_SHIP', 'ORDER_RECEIVE', 'ORDER_COMPLETE', 'ORDER_CANCEL'], default: 'ORDER_CREATE' })
  action: string;

  @Column({ length: 50, nullable: true })
  beforeStatus: string;

  @Column({ length: 50, nullable: true })
  afterStatus: string;

  @Column({ length: 50, nullable: true })
  ip: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  extra: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => OrderEntity, order => order.orderLogs)
  @JoinColumn({ name: 'orderId' })
  order: OrderEntity;
}