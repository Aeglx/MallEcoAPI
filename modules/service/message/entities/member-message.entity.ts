import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { MessageStatus } from './enums/message-status.enum';

@Entity('mall_member_message')
export class MemberMessage extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'member_id', nullable: true })
  memberId: string;

  @Column({ name: 'member_name', nullable: true })
  memberName: string;

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

  @CreateDateColumn({ name: 'send_time' })
  sendTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
