import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  SYSTEM = 'system',
  ORDER = 'order',
  ACTIVITY = 'activity',
  MESSAGE = 'message',
  REFUND = 'refund',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  DELETED = 'deleted',
}

@Entity('mall_notification')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.UNREAD })
  status: NotificationStatus;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({ name: 'link', nullable: true })
  link?: string;

  @Column({ name: 'is_push', type: 'tinyint', width: 1, nullable: false, default: 0 })
  isPush: number;

  @Column({ name: 'is_sms', type: 'tinyint', width: 1, nullable: false, default: 0 })
  isSms: number;

  @Column({ name: 'is_email', type: 'tinyint', width: 1, nullable: false, default: 0 })
  isEmail: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
