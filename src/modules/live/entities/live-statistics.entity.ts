import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { LiveRoom } from './live-room.entity';

@Entity('mall_live_statistics')
export class LiveStatistics extends BaseEntity {
  @Column({ name: 'live_room_id', nullable: false, comment: '直播间ID' })
  liveRoomId: string;

  @Column({ name: 'date', type: 'date', nullable: false, comment: '统计日期' })
  date: Date;

  @Column({ name: 'viewer_count', default: 0, comment: '观看人数' })
  viewerCount: number;

  @Column({ name: 'peak_viewer_count', default: 0, comment: '峰值观看人数' })
  peakViewerCount: number;

  @Column({ name: 'like_count', default: 0, comment: '点赞数' })
  likeCount: number;

  @Column({ name: 'share_count', default: 0, comment: '分享数' })
  shareCount: number;

  @Column({ name: 'comment_count', default: 0, comment: '评论数' })
  commentCount: number;

  @Column({ name: 'order_count', default: 0, comment: '订单数' })
  orderCount: number;

  @Column({
    name: 'sales_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: '销售额',
  })
  salesAmount: number;

  @Column({ name: 'avg_stay_time', type: 'int', default: 0, comment: '平均停留时间(秒)' })
  avgStayTime: number;

  @ManyToOne(() => LiveRoom, liveRoom => liveRoom.statistics)
  @JoinColumn({ name: 'live_room_id' })
  liveRoom: LiveRoom;
}
