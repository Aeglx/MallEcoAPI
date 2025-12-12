import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { LiveGoods } from './live-goods.entity';
import { LiveOrder } from './live-order.entity';
import { LiveChat } from './live-chat.entity';

@Entity('live_room')
export class LiveRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 64, comment: '直播间标题' })
  title: string;

  @Column({ type: 'text', nullable: true, comment: '直播间描述' })
  description: string;

  @Column({ length: 64, comment: '主播ID' })
  anchorId: string;

  @Column({ length: 64, comment: '主播名称' })
  anchorName: string;

  @Column({ length: 255, nullable: true, comment: '直播间封面图' })
  coverImage: string;

  @Column({ type: 'enum', enum: ['PENDING', 'LIVE', 'ENDED', 'PAUSED'], default: 'PENDING', comment: '直播状态' })
  status: string;

  @Column({ type: 'int', default: 0, comment: '观看人数' })
  viewerCount: number;

  @Column({ type: 'int', default: 0, comment: '点赞数' })
  likeCount: number;

  @Column({ type: 'datetime', nullable: true, comment: '计划开始时间' })
  scheduledStartTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '实际开始时间' })
  actualStartTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '结束时间' })
  endTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '销售额' })
  salesAmount: number;

  @Column({ type: 'int', default: 0, comment: '订单数量' })
  orderCount: number;

  @Column({ type: 'boolean', default: false, comment: '是否推荐' })
  isRecommended: boolean;

  @Column({ type: 'int', default: 0, comment: '推荐权重' })
  recommendationWeight: number;

  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  enabled: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;

  @OneToMany(() => LiveGoods, liveGoods => liveGoods.liveRoom)
  liveGoods: LiveGoods[];

  @OneToMany(() => LiveOrder, liveOrder => liveOrder.liveRoom)
  liveOrders: LiveOrder[];

  @OneToMany(() => LiveChat, liveChat => liveChat.liveRoom)
  liveChats: LiveChat[];
}