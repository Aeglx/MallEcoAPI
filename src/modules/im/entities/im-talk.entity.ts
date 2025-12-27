import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * IM聊天实体
 */
@Entity('mall_im_talk')
export class ImTalkEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'user_id1', length: 64 })
  userId1!: string;

  @Column({ name: 'user_id2', length: 64 })
  userId2!: string;

  @Column({ name: 'top1', type: 'tinyint', width: 1, default: false })
  top1!: boolean;

  @Column({ name: 'top2', type: 'tinyint', width: 1, default: false })
  top2!: boolean;

  @Column({ name: 'disable1', type: 'tinyint', width: 1, default: false })
  disable1!: boolean;

  @Column({ name: 'disable2', type: 'tinyint', width: 1, default: false })
  disable2!: boolean;

  @Column({ name: 'name1', length: 64 })
  name1!: string;

  @Column({ name: 'name2', length: 64 })
  name2!: string;

  @Column({ name: 'face1', length: 255, nullable: true })
  face1!: string | null;

  @Column({ name: 'face2', length: 255, nullable: true })
  face2!: string | null;

  @Column({ name: 'store_flag1', type: 'tinyint', width: 1, default: false })
  storeFlag1!: boolean;

  @Column({ name: 'store_flag2', type: 'tinyint', width: 1, default: false })
  storeFlag2!: boolean;

  @Column({ name: 'last_talk_time', type: 'datetime', nullable: true })
  lastTalkTime!: Date | null;

  @Column({ name: 'last_talk_message', type: 'text', nullable: true })
  lastTalkMessage!: string | null;

  @Column({ name: 'last_message_type', length: 32, nullable: true })
  lastMessageType!: string | null;

  @Column({ name: 'tenant_id', length: 64, nullable: true })
  tenantId!: string | null;

  @Column({ name: 'tenant_name', length: 255, nullable: true })
  tenantName!: string | null;

  @Column({ name: 'delete_flag', type: 'tinyint', width: 1, default: 0 })
  deleteFlag!: boolean;

  @Column({ name: 'create_time', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createTime!: Date;

  @Column({
    name: 'update_time',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updateTime!: Date;
}
