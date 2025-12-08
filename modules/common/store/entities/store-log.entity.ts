import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store, StoreStatus } from './store.entity';

export enum StoreOperateType {
  CREATE = 0, // 创建店铺
  UPDATE_INFO = 1, // 更新信息
  SUBMIT_AUDIT = 2, // 提交审核
  AUDIT_PASS = 3, // 审核通过
  AUDIT_REJECT = 4, // 审核拒绝
  OPEN_STORE = 5, // 开店
  CLOSE_STORE = 6, // 关店
  FREEZE_STORE = 7, // 冻结店铺
  UNFREEZE_STORE = 8, // 解冻店铺
  UPDATE_STATUS = 9, // 更新状态
  OTHER = 10, // 其他操作
}

@Entity('store_log')
export class StoreLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id', type: 'varchar', length: 36, comment: '店铺ID' })
  storeId: string;

  @Column({ name: 'store_name', type: 'varchar', length: 50, comment: '店铺名称' })
  storeName: string;

  @Column({ name: 'operate_type', type: 'int', comment: '操作类型' })
  operateType: StoreOperateType;

  @Column({ name: 'operate_id', type: 'varchar', length: 36, comment: '操作人ID' })
  operateId: string;

  @Column({ name: 'operate_name', type: 'varchar', length: 20, comment: '操作人名称' })
  operateName: string;

  @Column({ name: 'operate_time', type: 'datetime', comment: '操作时间' })
  operateTime: Date;

  @Column({ name: 'old_status', type: 'int', nullable: true, comment: '旧状态' })
  oldStatus: StoreStatus;

  @Column({ name: 'new_status', type: 'int', nullable: true, comment: '新状态' })
  newStatus: StoreStatus;

  @Column({ name: 'remark', type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @ManyToOne(() => Store, (store) => store.storeLogs)
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
