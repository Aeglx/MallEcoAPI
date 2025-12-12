import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LiveRoom } from './live-room.entity';

@Entity('live_statistics')
export class LiveStatistics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 64, comment: '直播间ID' })
  liveRoomId: string;

  @ManyToOne(() => LiveRoom, { nullable: true })
  @JoinColumn({ name: 'liveRoomId', referencedColumnName: 'id' })
  liveRoom: LiveRoom;

  @Column({ type: 'date', comment: '统计日期' })
  statisticsDate: Date;

  @Column({ type: 'int', default: 0, comment: '观看总人数' })
  totalViewers: number;

  @Column({ type: 'int', default: 0, comment: '新增观看人数' })
  newViewers: number;

  @Column({ type: 'int', default: 0, comment: '平均观看时长（秒）' })
  avgWatchDuration: number;

  @Column({ type: 'int', default: 0, comment: '总点赞数' })
  totalLikes: number;

  @Column({ type: 'int', default: 0, comment: '评论数' })
  commentCount: number;

  @Column({ type: 'int', default: 0, comment: '分享数' })
  shareCount: number;

  @Column({ type: 'int', default: 0, comment: '订单数' })
  orderCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, comment: '总销售额' })
  totalSales: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '客单价' })
  avgOrderValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, comment: '转化率' })
  conversionRate: number;

  @Column({ type: 'int', default: 0, comment: '退款订单数' })
  refundOrderCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, comment: '退款金额' })
  refundAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, comment: '退款率' })
  refundRate: number;

  @Column({ type: 'int', default: 0, comment: '活跃用户数' })
  activeUsers: number;

  @Column({ type: 'int', default: 0, comment: '新增关注数' })
  newFollowers: number;

  @Column({ type: 'int', default: 0, comment: '礼物收入' })
  giftIncome: number;

  @Column({ type: 'int', default: 0, comment: '礼物数量' })
  giftCount: number;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;
}