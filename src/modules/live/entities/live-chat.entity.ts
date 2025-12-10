import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { LivePermissionEnum } from '../enums/live-status.enum';

@Entity('live_chats')
@Index(['roomId'])
@Index(['userId'])
@Index(['createTime'])
export class LiveChat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  roomId: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string; // 发送者ID，系统消息时为空

  @Column({ length: 100, nullable: true })
  username: string; // 发送者用户名

  @Column({ length: 500, nullable: true })
  avatar: string; // 发送者头像

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: LivePermissionEnum,
    default: LivePermissionEnum.VIEWER
  })
  userRole: LivePermissionEnum; // 发送者角色

  @Column({ type: 'smallint', default: 0 })
  messageType: number; // 消息类型：0-普通消息，1-系统消息，2-礼物消息，3-进入消息，4-离开消息

  @Column({ type: 'boolean', default: false })
  isTop: boolean; // 是否置顶

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean; // 是否已删除

  @Column({ type: 'uuid', nullable: true })
  replyToId: string; // 回复的消息ID

  @Column({ type: 'json', nullable: true })
  extra: Record<string, any>; // 额外信息，如礼物信息等

  @CreateDateColumn()
  createTime: Date;
}