import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { ChatRoom } from './chat-room.entity';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChatRoom, room => room.id)
  chatRoom: ChatRoom;

  @Column()
  chatRoomId: string;

  @Column()
  senderId: string;

  @Column({ nullable: true })
  receiverId: string;

  @Column()
  content: string;

  @Column({ default: 'text' }) // text, image, voice, video, etc.
  type: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
