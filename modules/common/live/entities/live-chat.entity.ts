import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LiveRoom } from './live-room.entity';

@Entity('live_chat')
export class LiveChat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 64, comment: '直播间ID' })
  liveRoomId: string;

  @Column({ length: 64, comment: '发送者ID' })
  senderId: string;

  @Column({ length: 64, comment: '发送者名称' })
  senderName: string;

  @Column({ type: 'enum', enum: ['TEXT', 'IMAGE', 'GIFT', 'SYSTEM'], default: 'TEXT', comment: '消息类型' })
  messageType: string;

  @Column({ type: 'text', comment: '消息内容' })
  content: string;

  @Column({ length: 255, nullable: true, comment: '图片URL' })
  imageUrl: string;

  @Column({ length: 64, nullable: true, comment: '礼物ID' })
  giftId: string;

  @Column({ length: 255, nullable: true, comment: '礼物名称' })
  giftName: string;

  @Column({ type: 'int', nullable: true, comment: '礼物数量' })
  giftQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: '礼物价值' })
  giftValue: number;

  @Column({ type: 'boolean', default: false, comment: '是否主播消息' })
  isAnchorMessage: boolean;

  @Column({ type: 'boolean', default: false, comment: '是否管理员消息' })
  isAdminMessage: boolean;

  @Column({ type: 'boolean', default: false, comment: '是否被举报' })
  isReported: boolean;

  @Column({ type: 'int', default: 0, comment: '举报次数' })
  reportCount: number;

  @Column({ type: 'boolean', default: false, comment: '是否被删除' })
  isDeleted: boolean;

  @Column({ length: 64, nullable: true, comment: '删除操作人' })
  deletedBy: string;

  @Column({ type: 'datetime', nullable: true, comment: '删除时间' })
  deletedTime: Date;

  @Column({ type: 'text', nullable: true, comment: '删除原因' })
  deleteReason: string;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @ManyToOne(() => LiveRoom, liveRoom => liveRoom.liveChats)
  @JoinColumn({ name: 'liveRoomId' })
  liveRoom: LiveRoom;
}