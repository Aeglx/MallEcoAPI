import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Logistics } from './logistics.entity';

export enum LogisticsOperateType {
  CREATE = 0, // 创建物流
  UPDATE_STATUS = 1, // 更新状态
  UPDATE_INFO = 2, // 更新信息
  CANCEL = 3, // 取消物流
  OTHER = 4, // 其他操作
}

@Entity('logistics_log')
export class LogisticsLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'logistics_id', type: 'varchar', length: 36, comment: '物流ID' })
  logisticsId: string;

  @Column({ name: 'order_id', type: 'varchar', length: 36, comment: '订单ID' })
  orderId: string;

  @Column({ name: 'operate_type', type: 'int', comment: '操作类型' })
  operateType: LogisticsOperateType;

  @Column({ name: 'operate_id', type: 'varchar', length: 36, comment: '操作人ID' })
  operateId: string;

  @Column({ name: 'operate_name', type: 'varchar', length: 20, comment: '操作人名称' })
  operateName: string;

  @Column({ name: 'operate_time', type: 'datetime', comment: '操作时间' })
  operateTime: Date;

  @Column({ name: 'old_status', type: 'int', nullable: true, comment: '旧状态' })
  oldStatus: number;

  @Column({ name: 'new_status', type: 'int', nullable: true, comment: '新状态' })
  newStatus: number;

  @Column({ name: 'tracking_info', type: 'text', nullable: true, comment: '物流追踪信息' })
  trackingInfo: string;

  @Column({ name: 'remark', type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @ManyToOne(() => Logistics, (logistics) => logistics.logisticsLogs)
  @JoinColumn({ name: 'logistics_id' })
  logistics: Logistics;
}
