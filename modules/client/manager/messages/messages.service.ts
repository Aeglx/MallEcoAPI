import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, And } from 'typeorm';
import { Message, MessageStatus, MessageType, ReceiverType, SenderType } from './entities/message.entity';
import { CreateMessageDto, QueryMessageDto } from './dto/create-message.dto';
import { RabbitMQService } from '../../../../src/infrastructure/rabbitmq/rabbitmq.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message) private readonly messageRepository: Repository<Message>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  /**
   * 创建消息
   */
  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    // 创建消息实体
    const message = this.messageRepository.create({
      ...createMessageDto,
      status: MessageStatus.PENDING,
      sendTime: createMessageDto.sendTime ? new Date(createMessageDto.sendTime) : new Date(),
    });

    // 保存消息
    const savedMessage = await this.messageRepository.save(message);

    // 发送消息到RabbitMQ
    await this.rabbitMQService.emit('message.created', savedMessage);

    // 更新消息状态为已发送
    savedMessage.status = MessageStatus.SENT;
    await this.messageRepository.save(savedMessage);

    return savedMessage;
  }

  /**
   * 批量创建消息
   */
  async createBatch(messages: CreateMessageDto[]): Promise<Message[]> {
    if (!messages || messages.length === 0) {
      throw new BadRequestException('消息列表不能为空');
    }

    // 创建消息实体数组
    const messageEntities = messages.map((msg) =>
      this.messageRepository.create({
        ...msg,
        status: MessageStatus.PENDING,
        sendTime: msg.sendTime ? new Date(msg.sendTime) : new Date(),
      }),
    );

    // 批量保存消息
    const savedMessages = await this.messageRepository.save(messageEntities);

    // 发送消息到RabbitMQ
    for (const message of savedMessages) {
      await this.rabbitMQService.emit('message.created', message);

      // 更新消息状态为已发送
      message.status = MessageStatus.SENT;
    }

    // 批量更新消息状态
    await this.messageRepository.save(savedMessages);

    return savedMessages;
  }

  /**
   * 查询消息列表
   */
  async findAll(queryDto: QueryMessageDto): Promise<{ data: Message[]; total: number }> {
    const { page = 1, limit = 10, title, messageType, status, receiverId, receiverType, senderId, senderType, isRead, startTime, endTime } = queryDto;

    const query = this.messageRepository.createQueryBuilder('message');

    if (title) query.andWhere('message.title LIKE :title', { title: `%${title}%` });
    if (messageType) query.andWhere('message.messageType = :messageType', { messageType });
    if (status) query.andWhere('message.status = :status', { status });
    if (receiverId) query.andWhere('message.receiverId = :receiverId', { receiverId });
    if (receiverType) query.andWhere('message.receiverType = :receiverType', { receiverType });
    if (senderId) query.andWhere('message.senderId = :senderId', { senderId });
    if (senderType) query.andWhere('message.senderType = :senderType', { senderType });
    if (isRead !== undefined) query.andWhere('message.isRead = :isRead', { isRead });

    // 处理时间范围查询
    if (startTime && endTime) {
      query.andWhere('message.sendTime BETWEEN :startTime AND :endTime', { 
        startTime: new Date(startTime), 
        endTime: new Date(endTime) 
      });
    } else if (startTime) {
      query.andWhere('message.sendTime >= :startTime', { startTime: new Date(startTime) });
    } else if (endTime) {
      query.andWhere('message.sendTime <= :endTime', { endTime: new Date(endTime) });
    }

    // 按发送时间倒序排序
    query.orderBy('message.sendTime', 'DESC');

    // 分页查询
    const [data, total] = await query.skip((page - 1) * limit).take(limit).getManyAndCount();

    return { data, total };
  }

  /**
   * 查询单个消息
   */
  async findOne(id: string): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`消息不存在`);
    }
    return message;
  }

  /**
   * 删除消息
   */
  async remove(id: string): Promise<void> {
    const message = await this.findOne(id);
    await this.messageRepository.remove(message);
  }

  /**
   * 批量删除消息
   */
  async removeBatch(ids: string[]): Promise<{ message: string; affected: number }> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('消息ID列表不能为空');
    }

    // 批量删除消息
    const result = await this.messageRepository.delete(ids);

    return {
      message: `成功删除${result.affected || 0}条消息`,
      affected: result.affected || 0,
    };
  }

  /**
   * 更新消息状态
   */
  async updateStatus(id: string, status: MessageStatus): Promise<Message> {
    const message = await this.findOne(id);
    message.status = status;
    return await this.messageRepository.save(message);
  }

  /**
   * 标记消息为已读
   */
  async markAsRead(id: string): Promise<Message> {
    const message = await this.findOne(id);
    message.isRead = true;
    return await this.messageRepository.save(message);
  }

  /**
   * 批量标记消息为已读
   */
  async markAsReadBatch(ids: string[]): Promise<{ message: string; affected: number }> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('消息ID列表不能为空');
    }

    // 批量更新消息状态为已读
    const result = await this.messageRepository.update(ids, { isRead: true });

    return {
      message: `成功标记${result.affected || 0}条消息为已读`,
      affected: result.affected || 0,
    };
  }

  /**
   * 统计消息数量
   */
  async getStatistics(startTime?: string, endTime?: string): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const query = this.messageRepository.createQueryBuilder('message');

    // 处理时间范围查询
    if (startTime && endTime) {
      query.andWhere('message.sendTime BETWEEN :startTime AND :endTime', { 
        startTime: new Date(startTime), 
        endTime: new Date(endTime) 
      });
    } else if (startTime) {
      query.andWhere('message.sendTime >= :startTime', { startTime: new Date(startTime) });
    } else if (endTime) {
      query.andWhere('message.sendTime <= :endTime', { endTime: new Date(endTime) });
    }

    // 计算消息总数
    const total = await query.getCount();

    // 按消息类型统计
    const typeQuery = this.messageRepository.createQueryBuilder('message').select('messageType, COUNT(*) as count').groupBy('messageType');
    if (startTime && endTime) {
      typeQuery.andWhere('message.sendTime BETWEEN :startTime AND :endTime', { startTime: new Date(startTime), endTime: new Date(endTime) });
    } else if (startTime) {
      typeQuery.andWhere('message.sendTime >= :startTime', { startTime: new Date(startTime) });
    } else if (endTime) {
      typeQuery.andWhere('message.sendTime <= :endTime', { endTime: new Date(endTime) });
    }
    const typeStats = await typeQuery.getRawMany();

    // 按消息状态统计
    const statusQuery = this.messageRepository.createQueryBuilder('message').select('status, COUNT(*) as count').groupBy('status');
    if (startTime && endTime) {
      statusQuery.andWhere('message.sendTime BETWEEN :startTime AND :endTime', { startTime: new Date(startTime), endTime: new Date(endTime) });
    } else if (startTime) {
      statusQuery.andWhere('message.sendTime >= :startTime', { startTime: new Date(startTime) });
    } else if (endTime) {
      statusQuery.andWhere('message.sendTime <= :endTime', { endTime: new Date(endTime) });
    }
    const statusStats = await statusQuery.getRawMany();

    // 转换统计结果为对象
    const byType = typeStats.reduce((acc, item) => {
      acc[item.messageType] = parseInt(item.count, 10);
      return acc;
    }, {} as Record<string, number>);

    const byStatus = statusStats.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count, 10);
      return acc;
    }, {} as Record<string, number>);

    return { total, byType, byStatus };
  }
}
