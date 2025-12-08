import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberMessage } from '../entities/member-message.entity';
import { MessageStatus } from '../entities/enums/message-status.enum';
import { CreateMemberMessageDto, QueryMemberMessageDto, UpdateMemberMessageDto } from '../dto/member-message.dto';
import { RabbitMQService } from '../../../src/rabbitmq/rabbitmq.service';

@Injectable()
export class MemberMessageService {
  constructor(
    @InjectRepository(MemberMessage) private readonly memberMessageRepository: Repository<MemberMessage>,
    private readonly rabbitMQService: RabbitMQService
  ) {}

  async createMessage(createMemberMessageDto: CreateMemberMessageDto): Promise<MemberMessage> {
    const message = this.memberMessageRepository.create(createMemberMessageDto);
    const savedMessage = await this.memberMessageRepository.save(message);
    
    // 发送消息创建事件
    await this.rabbitMQService.emit('member.message.created', savedMessage);
    
    return savedMessage;
  }

  async createBatchMessage(messages: CreateMemberMessageDto[]): Promise<MemberMessage[]> {
    const memberMessages = this.memberMessageRepository.create(messages);
    const savedMessages = await this.memberMessageRepository.save(memberMessages);
    
    // 发送批量消息创建事件
    await this.rabbitMQService.emit('member.message.batch.created', savedMessages);
    
    return savedMessages;
  }

  async sendMessageToAllMembers(createMemberMessageDto: CreateMemberMessageDto): Promise<void> {
    const message = this.memberMessageRepository.create(createMemberMessageDto);
    await this.memberMessageRepository.save(message);
    
    // 发送消息广播事件
    await this.rabbitMQService.emit('member.message.broadcast', {
      ...createMemberMessageDto,
      sendToAll: true
    });
  }

  async getMessageById(id: string): Promise<MemberMessage> {
    const message = await this.memberMessageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }

  async updateMessageStatus(id: string, updateMemberMessageDto: UpdateMemberMessageDto): Promise<MemberMessage> {
    const message = await this.getMessageById(id);
    
    if (updateMemberMessageDto.status === MessageStatus.READ) {
      message.isRead = true;
    }
    message.status = updateMemberMessageDto.status;
    
    const updatedMessage = await this.memberMessageRepository.save(message);
    
    // 发送消息状态更新事件
    await this.rabbitMQService.emit('member.message.status.updated', updatedMessage);
    
    return updatedMessage;
  }

  async markAllAsRead(memberId: string): Promise<number> {
    const result = await this.memberMessageRepository.update(
      { memberId, isRead: false },
      { isRead: true, status: MessageStatus.READ }
    );
    
    // 发送标记全部已读事件
    await this.rabbitMQService.emit('member.message.all.read', {
      memberId,
      count: result.affected || 0
    });
    
    return result.affected || 0;
  }

  async deleteMessage(id: string): Promise<void> {
    const result = await this.memberMessageRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Message not found');
    }
  }

  async deleteAll(memberId: string): Promise<number> {
    const result = await this.memberMessageRepository.delete({ memberId });
    
    return result.affected || 0;
  }

  async getMessages(query: QueryMemberMessageDto): Promise<{ data: MemberMessage[]; total: number }> {
    const { page = 1, limit = 10, memberId, messageType, isRead } = query;
    const skip = (page - 1) * limit;
    
    const whereClause = {};
    if (memberId) whereClause['memberId'] = memberId;
    if (messageType) whereClause['messageType'] = messageType;
    if (isRead !== undefined) whereClause['isRead'] = isRead;
    
    const [data, total] = await this.memberMessageRepository.findAndCount({
      where: whereClause,
      skip,
      take: limit,
      order: { sendTime: 'DESC' }
    });
    
    return { data, total };
  }

  async getMessageStatistics(memberId: string): Promise<{ unreadCount: number; totalCount: number }> {
    const totalCount = await this.memberMessageRepository.count({ where: { memberId } });
    const unreadCount = await this.memberMessageRepository.count({ where: { memberId, isRead: false } });
    
    return { unreadCount, totalCount };
  }

  async getMessageCountByType(memberId: string): Promise<{ [key: string]: number }> {
    const result = await this.memberMessageRepository
      .createQueryBuilder('mm')
      .select('mm.messageType, COUNT(mm.id) as count')
      .where('mm.memberId = :memberId', { memberId })
      .groupBy('mm.messageType')
      .getRawMany();
    
    return result.reduce((acc, item) => {
      acc[item.mm_messageType] = parseInt(item.count, 10);
      return acc;
    }, {});
  }
}
