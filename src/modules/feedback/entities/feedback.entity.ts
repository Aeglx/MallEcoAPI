import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum FeedbackType {
  SUGGESTION = 'suggestion',
  COMPLAINT = 'complaint',
  QUESTION = 'question',
  BUG = 'bug',
  OTHER = 'other'
}

export enum FeedbackStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

@Entity('mall_feedback')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true })
  userId?: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'enum', enum: FeedbackType })
  type: FeedbackType;

  @Column({ type: 'enum', enum: FeedbackStatus, default: FeedbackStatus.PENDING })
  status: FeedbackStatus;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({ name: 'contact', nullable: true })
  contact?: string;

  @Column({ name: 'images', type: 'simple-array', nullable: true })
  images?: string[];

  @Column({ name: 'admin_id', nullable: true })
  adminId?: number;

  @Column({ name: 'reply', type: 'text', nullable: true })
  reply?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
