import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('mall_live')
export class Live extends BaseEntity {
  @Column({ name: 'live_title', length: 100, nullable: false, comment: '直播标题' })
  liveTitle: string;

  @Column({ name: 'live_description', type: 'text', nullable: true, comment: '直播描述' })
  liveDescription: string;

  @Column({ name: 'live_cover', length: 255, nullable: true, comment: '直播封面图片' })
  liveCover: string;

  @Column({ name: 'anchor_name', length: 50, nullable: false, comment: '主播名称' })
  anchorName: string;

  @Column({ name: 'anchor_avatar', length: 255, nullable: true, comment: '主播头像' })
  anchorAvatar: string;

  @Column({ name: 'start_time', type: 'datetime', nullable: true, comment: '开始时间' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime', nullable: true, comment: '结束时间' })
  endTime: Date;

  @Column({ name: 'live_status', type: 'int', default: 0, comment: '直播状态：0-未开始，1-直播中，2-已结束，3-已取消' })
  liveStatus: number;

  @Column({ name: 'live_url', length: 255, nullable: true, comment: '直播观看地址' })
  liveUrl: string;

  @Column({ name: 'room_number', length: 20, nullable: true, comment: '直播间号' })
  roomNumber: string;

  @Column({ name: 'view_count', type: 'int', default: 0, comment: '观看人数' })
  viewCount: number;

  @Column({ name: 'like_count', type: 'int', default: 0, comment: '点赞数' })
  likeCount: number;

  @Column({ name: 'share_count', type: 'int', default: 0, comment: '分享数' })
  shareCount: number;

  @Column({ name: 'is_top', type: 'int', default: 0, comment: '是否置顶' })
  isTop: number;

  @Column({ name: 'is_recommend', type: 'int', default: 0, comment: '是否推荐' })
  isRecommend: number;

  @Column({ name: 'live_intro', type: 'text', nullable: true, comment: '直播简介' })
  liveIntro: string;
}

