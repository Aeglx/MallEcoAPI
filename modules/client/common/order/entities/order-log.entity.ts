import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../../common/base.entity';
import { Order } from './order.entity';

@Entity('mall_order_log')
@Index(['orderId'])
@Index(['operateTime'])
export class OrderLog extends BaseEntity {
  @Column({ length: 32, name: 'order_id' })
  orderId: string;

  @Column({ length: 32, name: 'operate_id', nullable: true })
  operateId: string;

  @Column({ length: 50, name: 'operate_name', nullable: true })
  operateName: string;

  @Column({ name: 'operate_time', type: 'datetime' })
  operateTime: Date;

  @Column({ name: 'order_status', nullable: true })
  orderStatus: number;

  @Column({ name: 'pay_status', nullable: true })
  payStatus: number;

  @Column({ name: 'ship_status', nullable: true })
  shipStatus: number;

  @Column('text', { name: 'remark', nullable: true })
  remark: string;

  // 鍏宠仈鍏崇郴
  @ManyToOne(() => Order, (order) => order.orderLogs, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}





