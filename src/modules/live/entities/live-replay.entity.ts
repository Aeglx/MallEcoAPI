import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('live_replays')
@Index(['roomId'])
@Index(['userId'])
export class LiveReplay {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  roomId: string;

  @Column({ type: 'uuid' })
  userId: string; // 主播ID

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 500 })
  videoUrl: string; // 回放视频地址

  @Column({ length: 500, nullable: true })
  thumbnail: string; // 缩略图

  @Column({ type: 'int', default: 0 })
  duration: number; // 回放时长（秒）

  @Column({ type: 'bigint', default: 0 })
  fileSize: number; // 文件大小（字节）

  @Column({ type: 'int', default: 0 })
  viewCount: number; // 观看次数

  @Column({ type: 'int', default: 0 })
  likeCount: number; // 点赞数

  @Column({ type: 'int', default: 0 })
  shareCount: number; // 分享数

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  salesAmount: number; // 回放期间产生的销售额

  @Column({ type: 'int', default: 0 })
  orderCount: number; // 回放期间产生的订单数

  @Column({ type: 'boolean', default: true })
  isPublic: boolean; // 是否公开

  @Column({ type: 'boolean', default: false })
  isProcessing: boolean; // 是否正在处理

  @Column({ type: 'timestamp', nullable: true })
  processedTime: Date; // 处理完成时间

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // 元数据信息

  @CreateDateColumn()
  createTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleteTime: Date;
}