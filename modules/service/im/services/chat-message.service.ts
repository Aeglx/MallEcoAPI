import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ChatMessage } from '../entities/chat-message.entity';
import { CreateChatMessageDto, UpdateChatMessageDto, QueryChatMessageDto, MarkReadDto } from '../dto/chat-message.dto';
import { RabbitMQService } from '../../../src/rabbitmq/rabbitmq.service';
import { ImTalkService } from './im-talk.service';
import { ChatRoomService } from './chat-room.service';

@Injectable()
export class ChatMessageService {
  constructor(
    @InjectRepository(ChatMessage) private readonly chatMessageRepository: Repository<ChatMessage>,
    private readonly rabbitMQService: RabbitMQService,
    private readonly imTalkService: ImTalkService,
    private readonly chatRoomService: ChatRoomService
  ) {}

  async createChatMessage(createChatMessageDto: CreateChatMessageDto): Promise<ChatMessage> {
    const chatMessage = this.chatMessageRepository.create(createChatMessageDto);
    const savedChatMessage = await this.chatMessageRepository.save(chatMessage);
    
    // 更新ImTalk中的最后一条消息
    try {
      // 对于单聊场景，根据发送者和接收者ID更新对应的ImTalk记录
      if (savedChatMessage.senderId && savedChatMessage.receiverId && savedChatMessage.senderId !== savedChatMessage.receiverId) {
        const talk = await this.imTalkService.createOrGetTalk(
          savedChatMessage.senderId,
          savedChatMessage.receiverId
        );
        if (talk) {
          await this.imTalkService.updateLastTalkMessage(
            talk.id,
            savedChatMessage.content,
            savedChatMessage.type
          );
        }
      }
    } catch (error) {
      console.error('Failed to update last talk message:', error);
    }
    
    // 发送创建聊天消息事件
    await this.rabbitMQService.emit('chat.message.created', savedChatMessage);
    
    return savedChatMessage;
  }

  async getChatMessageById(id: string): Promise<ChatMessage> {
    const chatMessage = await this.chatMessageRepository.findOne({ where: { id } });
    if (!chatMessage) {
      throw new NotFoundException('Chat message not found');
    }
    return chatMessage;
  }

  async updateChatMessage(id: string, updateChatMessageDto: UpdateChatMessageDto): Promise<ChatMessage> {
    const chatMessage = await this.getChatMessageById(id);
    
    Object.assign(chatMessage, updateChatMessageDto);
    const updatedChatMessage = await this.chatMessageRepository.save(chatMessage);
    
    // 发送更新聊天消息事件
    await this.rabbitMQService.emit('chat.message.updated', updatedChatMessage);
    
    return updatedChatMessage;
  }

  async deleteChatMessage(id: string): Promise<void> {
    const result = await this.chatMessageRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Chat message not found');
    }
    
    // 发送删除聊天消息事件
    await this.rabbitMQService.emit('chat.message.deleted', { id });
  }

  async getChatMessages(query: QueryChatMessageDto): Promise<{ data: ChatMessage[]; total: number }> {
    const { chatRoomId, page = 1, limit = 10, isRead } = query;
    const skip = (page - 1) * limit;
    
    const whereClause: any = { chatRoomId };
    if (isRead !== undefined) {
      whereClause.isRead = isRead;
    }
    
    const [data, total] = await this.chatMessageRepository.findAndCount({
      where: whereClause,
      skip,
      take: limit,
      order: { createdAt: 'DESC' }
    });
    
    return { data, total };
  }

  async markMessagesAsRead(markReadDto: MarkReadDto): Promise<number> {
    const result = await this.chatMessageRepository.update(
      { id: In(markReadDto.messageIds) },
      { isRead: true }
    );
    
    // 发送标记已读事件
    await this.rabbitMQService.emit('chat.message.marked.read', { messageIds: markReadDto.messageIds });
    
    return result.affected || 0;
  }

  async getUnreadCount(chatRoomId: string): Promise<number> {
    return await this.chatMessageRepository.count({ where: { chatRoomId, isRead: false } });
  }
}
