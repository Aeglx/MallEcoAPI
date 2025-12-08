import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { LogisticsLog } from './logistics-log.entity';

export enum LogisticsStatus {
  NOT_SEND = 0, // 未发货
  WAITING_RECEIVE = 1, // 待收货
  DELIVERING = 2, // 配送中
  RECEIVED = 3, // 已收货
  EXCEPTION = 4, // 异常
  RETURNED = 5, // 已退货
}

export enum LogisticsCompany {
  SF = 'SF', // 顺丰速运
  STO = 'STO', // 申通快递
  YTO = 'YTO', // 圆通速递
  ZTO = 'ZTO', // 中通快递
  YD = 'YD', // 韵达快递
  EMS = 'EMS', // 邮政EMS
  JD = 'JD', // 京东物流
  OTHER = 'OTHER', // 其他
}

@Entity('logistics')
export class Logistics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'varchar', length: 36, comment: '订单ID' })
  orderId: string;

  @Column({ name: 'logistics_company', type: 'enum', enum: LogisticsCompany, comment: '物流公司' })
  logisticsCompany: LogisticsCompany;

  @Column({ name: 'logistics_no', type: 'varchar', length: 50, unique: true, comment: '物流单号' })
  logisticsNo: string;

  @Column({ name: 'logistics_status', type: 'int', default: LogisticsStatus.NOT_SEND, comment: '物流状态' })
  logisticsStatus: LogisticsStatus;

  @Column({ name: 'sender_name', type: 'varchar', length: 20, comment: '发件人姓名' })
  senderName: string;

  @Column({ name: 'sender_phone', type: 'varchar', length: 15, comment: '发件人电话' })
  senderPhone: string;

  @Column({ name: 'sender_address', type: 'varchar', length: 200, comment: '发件人地址' })
  senderAddress: string;

  @Column({ name: 'receiver_name', type: 'varchar', length: 20, comment: '收件人姓名' })
  receiverName: string;

  @Column({ name: 'receiver_phone', type: 'varchar', length: 15, comment: '收件人电话' })
  receiverPhone: string;

  @Column({ name: 'receiver_address', type: 'varchar', length: 200, comment: '收件人地址' })
  receiverAddress: string;

  @Column({ name: 'weight', type: 'decimal', precision: 10, scale: 2, default: 0, comment: '重量(kg)' })
  weight: number;

  @Column({ name: 'volume', type: 'decimal', precision: 10, scale: 2, default: 0, comment: '体积(m³)' })
  volume: number;

  @Column({ name: 'delivery_fee', type: 'decimal', precision: 10, scale: 2, default: 0, comment: '配送费' })
  deliveryFee: number;

  @Column({ name: 'estimated_delivery_time', type: 'datetime', nullable: true, comment: '预计送达时间' })
  estimatedDeliveryTime: Date;

  @Column({ name: 'actual_delivery_time', type: 'datetime', nullable: true, comment: '实际送达时间' })
  actualDeliveryTime: Date;

  @Column({ name: 'tracking_url', type: 'varchar', length: 200, nullable: true, comment: '物流追踪URL' })
  trackingUrl: string;

  @Column({ name: 'remark', type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  @OneToMany(() => LogisticsLog, (logisticsLog) => logisticsLog.logistics)
  logisticsLogs: LogisticsLog[];
}
