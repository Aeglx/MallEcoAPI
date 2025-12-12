import { Entity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('im_talk')
export class ImTalk extends BaseEntity {
  @Column({ name: 'user_id1', length: 32, comment: '用户1 ID' })
  userId1: string;

  @Column({ name: 'user_id2', comment: '用户2 ID' })
  userId2: string;

  @Column({ name: 'top1', type: 'boolean', default: false, comment: '用户1置顶' })
  top1: boolean;

  @Column({ name: 'top2', type: 'boolean', default: false, comment: '用户2置顶' })
  top2: boolean;

  @Column({ name: 'disable1', type: 'boolean', default: false, comment: '用户1不可见' })
  disable1: boolean;

  @Column({ name: 'disable2', type: 'boolean', default: false, comment: '用户2不可见' })
  disable2: boolean;

  @Column({ name: 'name1', nullable: true, comment: '用户1名字' })
  name1: string;

  @Column({ name: 'name2', nullable: true, comment: '用户2名字' })
  name2: string;

  @Column({ name: 'face1', nullable: true, comment: '用户1头像' })
  face1: string;

  @Column({ name: 'face2', nullable: true, comment: '用户2头像' })
  face2: string;

  @Column({ name: 'store_flag1', type: 'boolean', default: false, comment: '用户1的店铺标识' })
  storeFlag1: boolean;

  @Column({ name: 'store_flag2', type: 'boolean', default: false, comment: '用户2的店铺标识' })
  storeFlag2: boolean;

  @Column({ name: 'last_talk_time', type: 'timestamp', nullable: true, comment: '最后聊天时间' })
  lastTalkTime: Date;

  @Column({ name: 'last_talk_message', nullable: true, comment: '最后聊天内容' })
  lastTalkMessage: string;

  @Column({ name: 'last_message_type', nullable: true, comment: '最后发送消息类型' })
  lastMessageType: string;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}