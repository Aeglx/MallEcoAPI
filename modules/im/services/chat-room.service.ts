import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom } from '../entities/chat-room.entity';
import { CreateChatRoomDto, UpdateChatRoomDto, QueryChatRoomDto } from '../dto/chat-room.dto';
import { RabbitMQService } from '../../../src/rabbitmq/rabbitmq.service';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectRepository(ChatRoom) private readonly chatRoomRepository: Repository<ChatRoom>,
    private readonly rabbitMQService: RabbitMQService
  ) {}

  async createChatRoom(createChatRoomDto: CreateChatRoomDto): Promise<ChatRoom> {
    const chatRoom = this.chatRoomRepository.create(createChatRoomDto);
    const savedChatRoom = await this.chatRoomRepository.save(chatRoom);
    
    // 发送创建聊天房间事件
    await this.rabbitMQService.emit('chat.room.created', savedChatRoom);
    
    return savedChatRoom;
  }

  async getChatRoomById(id: string): Promise<ChatRoom> {
    const chatRoom = await this.chatRoomRepository.findOne({ where: { id } });
    if (!chatRoom) {
      throw new NotFoundException('Chat room not found');
    }
    return chatRoom;
  }

  async updateChatRoom(id: string, updateChatRoomDto: UpdateChatRoomDto): Promise<ChatRoom> {
    const chatRoom = await this.getChatRoomById(id);
    
    Object.assign(chatRoom, updateChatRoomDto);
    const updatedChatRoom = await this.chatRoomRepository.save(chatRoom);
    
    // 发送更新聊天房间事件
    await this.rabbitMQService.emit('chat.room.updated', updatedChatRoom);
    
    return updatedChatRoom;
  }

  async deleteChatRoom(id: string): Promise<void> {
    const result = await this.chatRoomRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Chat room not found');
    }
    
    // 发送删除聊天房间事件
    await this.rabbitMQService.emit('chat.room.deleted', { id });
  }

  async getChatRooms(query: QueryChatRoomDto): Promise<{ data: ChatRoom[]; total: number }> {
    const { page = 1, limit = 10, type, keyword } = query;
    const skip = (page - 1) * limit;
    
    const whereClause: any = {};
    if (type) {
      whereClause.type = type;
    }
    
    const qb = this.chatRoomRepository.createQueryBuilder('chatRoom');
    
    if (keyword) {
      qb.where('chatRoom.name LIKE :keyword OR chatRoom.description LIKE :keyword', { keyword: `%${keyword}%` });
    }
    
    if (type) {
      qb.andWhere('chatRoom.type = :type', { type });
    }
    
    const [data, total] = await qb
      .skip(skip)
      .take(limit)
      .orderBy('chatRoom.createdAt', 'DESC')
      .getManyAndCount();
    
    return { data, total };
  }
}
