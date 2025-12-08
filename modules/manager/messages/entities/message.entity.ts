import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../../common/base.entity';

export enum MessageType {
  SYSTEM_NOTICE = 'system_notice',
  ORDER_MESSAGE = 'order_message',
  PRODUCT_MESSAGE = 'product_message',
  PAYMENT_MESSAGE = 'payment_message',
  REFUND_MESSAGE = 'refund_message',
  STORE_MESSAGE = 'store_message',
}

export enum MessageStatus {
  SENT = 'sent',
  PENDING = 'pending',
  FAILED = 'failed',
}

export enum ReceiverType {
  USER = 'user',
  SELLER = 'seller',
  MANAGER = 'manager',
  ALL = 'all',
}

export enum SenderType {
  SYSTEM = 'system',
  SELLER = 'seller',
  MANAGER = 'manager',
}

@Entity('mall_messages')
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false, comment: '消息标题' })
  title: string;

  @Column({ type: 'text', nullable: false, comment: '消息内容' })
  content: string;

  @Column({ type: 'enum', enum: MessageType, nullable: false, comment: '消息类型' })
  messageType: MessageType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', comment: '发送时间' })
  sendTime: Date;

  @Column({ type: 'enum', enum: MessageStatus, default: MessageStatus.PENDING, comment: '消息状态' })
  status: MessageStatus;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '接收者ID' })
  receiverId: string;

  @Column({ type: 'enum', enum: ReceiverType, default: ReceiverType.ALL, comment: '接收者类型' })
  receiverType: ReceiverType;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '发送者ID' })
  senderId: string;

  @Column({ type: 'enum', enum: SenderType, default: SenderType.SYSTEM, comment: '发送者类型' })
  senderType: SenderType;

  @Column({ type: 'boolean', default: false, comment: '是否已读' })
  isRead: boolean;

  @Column({ type: 'json', nullable: true, comment: '扩展数据' })
  extraData: any;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}
