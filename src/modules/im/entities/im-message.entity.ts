import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * IM消息实体
 */
@Entity('mall_im_message')
export class ImMessageEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'from_user', length: 64 })
  fromUser!: string;

  @Column({ name: 'to_user', length: 64 })
  toUser!: string;

  @Column({ name: 'is_read', type: 'tinyint', width: 1, default: false })
  isRead!: boolean;

  @Column({ name: 'message_type', length: 32, default: 'MESSAGE' })
  messageType!: string;

  @Column({ name: 'talk_id', length: 64 })
  talkId!: string;

  @Column({ name: 'text', type: 'text' })
  text!: string;

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
