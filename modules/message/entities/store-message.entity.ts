import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { MessageStatus } from './enums/message-status.enum';

@Entity('mall_store_message')
export class StoreMessage extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id', nullable: true })
  storeId: string;

  @Column({ name: 'store_name', nullable: true })
  storeName: string;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'message_type', type: 'enum', enum: ['system', 'order', 'promotion', 'custom'] })
  messageType: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'status', type: 'enum', enum: MessageStatus, default: MessageStatus.UNREAD })
  status: MessageStatus;

  @CreateDateColumn({ name: 'send_time', default: () => 'CURRENT_TIMESTAMP' })
  sendTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
