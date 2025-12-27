import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { LiveGoods } from './live-goods.entity';
import { LiveStatistics } from './live-statistics.entity';

@Entity('mall_live_room')
export class LiveRoom extends BaseEntity {
  @Column({ name: 'room_name', length: 255, nullable: false, comment: '直播间名称' })
  roomName: string;

  @Column({ name: 'anchor_id', nullable: false, comment: '主播ID' })
  anchorId: string;

  @Column({ name: 'anchor_name', length: 100, nullable: false, comment: '主播名称' })
  anchorName: string;

  @Column({ name: 'cover_image', length: 255, nullable: false, comment: '封面图片' })
  coverImage: string;

  @Column({
    name: 'status',
    type: 'tinyint',
    default: 0,
    comment: '状态：0-未开播，1-直播中，2-已结束',
  })
  status: number;

  @Column({ name: 'start_time', type: 'datetime', nullable: true, comment: '开始时间' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime', nullable: true, comment: '结束时间' })
  endTime: Date;

  @Column({ name: 'viewer_count', default: 0, comment: '观看人数' })
  viewerCount: number;

  @Column({ name: 'like_count', default: 0, comment: '点赞数' })
  likeCount: number;

  @Column({ name: 'share_count', default: 0, comment: '分享数' })
  shareCount: number;

  @Column({ name: 'description', type: 'text', nullable: true, comment: '直播间描述' })
  description: string;

  @Column({ name: 'tags', type: 'varchar', length: 255, nullable: true, comment: '标签' })
  tags: string;

  @OneToMany(() => LiveGoods, liveGoods => liveGoods.liveRoom)
  liveGoods: LiveGoods[];

  @OneToMany(() => LiveStatistics, statistics => statistics.liveRoom)
  statistics: LiveStatistics[];
}
