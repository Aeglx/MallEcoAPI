import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('live_follows')
@Index(['roomId'])
@Index(['userId'])
export class LiveFollow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  roomId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'boolean', default: true })
  isFollowing: boolean; // 是否关注

  @Column({ type: 'boolean', default: false })
  isSubscribed: boolean; // 是否订阅

  @Column({ type: 'timestamp', nullable: true })
  reminderTime: Date; // 提醒时间

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>; // 关注设置

  @CreateDateColumn()
  createTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleteTime: Date;
}