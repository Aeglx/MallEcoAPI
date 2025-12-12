import { Entity, Column, Index, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../../common/base.entity';
import { OrderItem } from './order-item.entity';
import { OrderLog } from './order-log.entity';

@Entity('mall_order')
@Index(['orderSn'])
@Index(['memberId'])
@Index(['storeId'])
@Index(['orderStatus'])
@Index(['payStatus'])
@Index(['shipStatus'])
export class Order extends BaseEntity {
  @Column({ length: 30, unique: true, name: 'order_sn' })
  orderSn: string;

  @Column({ length: 32, name: 'member_id' })
  memberId: string;

  @Column({ length: 32, name: 'store_id' })
  storeId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'pay_amount' })
  payAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'freight_amount' })
  freightAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'discount_amount' })
  discountAmount: number;

  @Column({ name: 'order_status' })
  orderStatus: number;

  @Column({ name: 'pay_status' })
  payStatus: number;

  @Column({ name: 'ship_status' })
  shipStatus: number;

  @Column({ length: 20, name: 'pay_type', nullable: true })
  payType: string;

  @Column({ name: 'pay_time', type: 'datetime', nullable: true })
  payTime: Date;

  @Column({ name: 'ship_time', type: 'datetime', nullable: true })
  shipTime: Date;

  @Column({ name: 'receive_time', type: 'datetime', nullable: true })
  receiveTime: Date;

  @Column({ name: 'cancel_time', type: 'datetime', nullable: true })
  cancelTime: Date;

  @Column({ length: 20, name: 'consignee_name' })
  consigneeName: string;

  @Column({ length: 20, name: 'consignee_mobile' })
  consigneeMobile: string;

  @Column({ length: 255, name: 'consignee_address' })
  consigneeAddress: string;

  @Column({ length: 255, name: 'remark', nullable: true })
  remark: string;

  @Column({ length: 30, name: 'tracking_no', nullable: true })
  trackingNo: string;

  @Column({ length: 30, name: 'logistics_company', nullable: true })
  logisticsCompany: string;

  // 鍏宠仈鍏崇郴
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  @OneToMany(() => OrderLog, (orderLog) => orderLog.order)
  orderLogs: OrderLog[];
}





