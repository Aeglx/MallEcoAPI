import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { LiveStatusEnum, LiveTypeEnum } from '../enums/live-status.enum';

@Entity('live_rooms')
@Index(['status'])
@Index(['startTime'])
@Index(['endTime'])
export class LiveRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 500, nullable: true })
  coverImage: string;

  @Column({ length: 200, nullable: true })
  streamKey: string;

  @Column({ length: 200, nullable: true })
  playUrl: string;

  @Column({
    type: 'enum',
    enum: LiveStatusEnum,
    default: LiveStatusEnum.NOT_STARTED
  })
  status: LiveStatusEnum;

  @Column({
    type: 'enum',
    enum: LiveTypeEnum,
    default: LiveTypeEnum.NORMAL
  })
  type: LiveTypeEnum;

  @Column({ type: 'int', default: 0 })
  viewerCount: number;

  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @Column({ type: 'int', default: 0 })
  giftCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  salesAmount: number;

  @Column({ type: 'int', default: 0 })
  orderCount: number;

  @Column({ type: 'int', nullable: true })
  maxViewers: number;

  @Column({ type: 'int', default: 0 })
  duration: number; // 直播时长（分钟）

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledStartTime: Date; // 预定开始时间

  @Column({ type: 'boolean', default: false })
  isRecording: boolean;

  @Column({ type: 'boolean', default: false })
  enableChat: boolean;

  @Column({ type: 'boolean', default: false })
  enableGift: boolean;

  @Column({ type: 'json', nullable: true })
  settings: Record<string, any>; // 直播设置

  @Column({ type: 'uuid' })
  userId: string; // 主播ID

  @Column({ type: 'uuid', nullable: true })
  storeId: string; // 店铺ID

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleteTime: Date;
}