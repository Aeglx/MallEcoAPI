import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreMessage } from '../entities/store-message.entity';
import { MessageStatus } from '../entities/enums/message-status.enum';
import { CreateStoreMessageDto, QueryStoreMessageDto, UpdateStoreMessageDto } from '../dto/store-message.dto';
import { RabbitMqService } from '../../../src/rabbitmq/rabbitmq.service';

@Injectable()
export class StoreMessageService {
  constructor(
    @InjectRepository(StoreMessage) private readonly storeMessageRepository: Repository<StoreMessage>,
    private readonly rabbitMqService: RabbitMqService
  ) {}

  async createMessage(createStoreMessageDto: CreateStoreMessageDto): Promise<StoreMessage> {
    const message = this.storeMessageRepository.create(createStoreMessageDto);
    const savedMessage = await this.storeMessageRepository.save(message);
    
    // 发送消息事件
    await this.rabbitMqService.publish('store-message', 'store.message.created', savedMessage);
    
    return savedMessage;
  }

  async createBatchMessage(messages: CreateStoreMessageDto[]): Promise<StoreMessage[]> {
    const storeMessages = this.storeMessageRepository.create(messages);
    const savedMessages = await this.storeMessageRepository.save(storeMessages);
    
    // 发送批量消息事件
    await this.rabbitMqService.publish('store-message', 'store.message.batch.created', savedMessages);
    
    return savedMessages;
  }

  async sendMessageToAllStores(createStoreMessageDto: CreateStoreMessageDto): Promise<void> {
    const message = this.storeMessageRepository.create(createStoreMessageDto);
    await this.storeMessageRepository.save(message);
    
    // 发送消息给所有店铺的事件
    await this.rabbitMqService.publish('store-message', 'store.message.broadcast', {
      ...createStoreMessageDto,
      sendToAll: true
    });
  }

  async getMessageById(id: string): Promise<StoreMessage> {
    const message = await this.storeMessageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }

  async updateMessageStatus(id: string, updateStoreMessageDto: UpdateStoreMessageDto): Promise<StoreMessage> {
    const message = await this.getMessageById(id);
    
    if (updateStoreMessageDto.status === 'read') {
      message.isRead = true;
    }
    message.status = updateStoreMessageDto.status;
    
    const updatedMessage = await this.storeMessageRepository.save(message);
    
    // 发送消息状态更新事件
    await this.rabbitMqService.publish('store-message', 'store.message.status.updated', updatedMessage);
    
    return updatedMessage;
  }

  async markAllAsRead(storeId: string): Promise<number> {
    const result = await this.storeMessageRepository.update(
      { storeId, isRead: false },
      { isRead: true, status: MessageStatus.READ }
    );
    
    // 发送标记全部已读事件
    await this.rabbitMqService.publish('store-message', 'store.message.all.read', {
      storeId,
      count: result.affected || 0
    });
    
    return result.affected || 0;
  }

  async deleteMessage(id: string): Promise<void> {
    const result = await this.storeMessageRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Message not found');
    }
    
    // 发送消息删除事件
    await this.rabbitMqService.publish('store-message', 'store.message.deleted', { id });
  }

  async deleteAll(storeId: string): Promise<number> {
    const result = await this.storeMessageRepository.delete({ storeId });
    
    // 发送删除全部消息事件
    await this.rabbitMqService.publish('store-message', 'store.message.all.deleted', {
      storeId,
      count: result.affected || 0
    });
    
    return result.affected || 0;
  }

  async getMessages(query: QueryStoreMessageDto): Promise<{ data: StoreMessage[]; total: number }> {
    const { page = 1, limit = 10, storeId, messageType, isRead } = query;
    const skip = (page - 1) * limit;
    
    const whereClause = {};
    if (storeId) whereClause['storeId'] = storeId;
    if (messageType) whereClause['messageType'] = messageType;
    if (isRead !== undefined) whereClause['isRead'] = isRead;
    
    const [data, total] = await this.storeMessageRepository.findAndCount({
      where: whereClause,
      skip,
      take: limit,
      order: { sendTime: 'DESC' }
    });
    
    return { data, total };
  }

  async getMessageStatistics(storeId: string): Promise<{ unreadCount: number; totalCount: number }> {
    const totalCount = await this.storeMessageRepository.count({ where: { storeId } });
    const unreadCount = await this.storeMessageRepository.count({ where: { storeId, isRead: false } });
    
    return { unreadCount, totalCount };
  }

  async getMessageCountByType(storeId: string): Promise<{ [key: string]: number }> {
    const result = await this.storeMessageRepository
      .createQueryBuilder('sm')
      .select('sm.messageType, COUNT(sm.id) as count')
      .where('sm.storeId = :storeId', { storeId })
      .groupBy('sm.messageType')
      .getRawMany();
    
    return result.reduce((acc, item) => {
      acc[item.sm_messageType] = parseInt(item.count, 10);
      return acc;
    }, {});
  }
}
