import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveChat } from '../entities/live-chat.entity';
import { LiveRoom } from '../entities/live-room.entity';
import { CreateLiveChatDto } from '../dto/create-live-chat.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class LiveChatService {
  constructor(
    @InjectRepository(LiveChat)
    private readonly liveChatRepository: Repository<LiveChat>,
    @InjectRepository(LiveRoom)
    private readonly liveRoomRepository: Repository<LiveRoom>,
  ) {}

  /**
   * 发送聊天消息
   */
  async sendMessage(createLiveChatDto: CreateLiveChatDto): Promise<LiveChat> {
    // 验证直播间是否存在且正在直播
    const liveRoom = await this.liveRoomRepository.findOne({
      where: { id: createLiveChatDto.liveRoomId }
    });

    if (!liveRoom) {
      throw new NotFoundException(`直播间 ${createLiveChatDto.liveRoomId} 不存在`);
    }

    if (liveRoom.status !== 'LIVE') {
      throw new BadRequestException('直播间未在直播中，无法发送消息');
    }

    const liveChat = this.liveChatRepository.create(createLiveChatDto);
    return await this.liveChatRepository.save(liveChat);
  }

  /**
   * 获取直播间聊天记录
   */
  async getChatHistory(liveRoomId: string, paginationDto: PaginationDto): Promise<[LiveChat[], number]> {
    const { page = 1, limit = 50, startTime, endTime } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.liveChatRepository.createQueryBuilder('liveChat')
      .where('liveChat.liveRoomId = :liveRoomId', { liveRoomId })
      .andWhere('liveChat.isDeleted = :isDeleted', { isDeleted: false });

    if (startTime && endTime) {
      queryBuilder.andWhere('liveChat.createTime BETWEEN :startTime AND :endTime', {
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      });
    }

    queryBuilder.orderBy('liveChat.createTime', 'ASC')
      .skip(skip)
      .take(limit);

    return await queryBuilder.getManyAndCount();
  }

  /**
   * 获取直播间最新消息
   */
  async getLatestMessages(liveRoomId: string, limit: number = 20): Promise<LiveChat[]> {
    return await this.liveChatRepository.find({
      where: { 
        liveRoomId,
        isDeleted: false 
      },
      order: { createTime: 'DESC' },
      take: limit
    });
  }

  /**
   * 删除消息（管理员操作）
   */
  async deleteMessage(id: string, deletedBy: string, reason: string): Promise<LiveChat> {
    const liveChat = await this.liveChatRepository.findOne({
      where: { id }
    });

    if (!liveChat) {
      throw new NotFoundException(`消息 ${id} 不存在`);
    }

    if (liveChat.isDeleted) {
      throw new BadRequestException('消息已经被删除');
    }

    liveChat.isDeleted = true;
    liveChat.deletedBy = deletedBy;
    liveChat.deletedTime = new Date();
    liveChat.deleteReason = reason;

    return await this.liveChatRepository.save(liveChat);
  }

  /**
   * 举报消息
   */
  async reportMessage(id: string): Promise<LiveChat> {
    const liveChat = await this.liveChatRepository.findOne({
      where: { id }
    });

    if (!liveChat) {
      throw new NotFoundException(`消息 ${id} 不存在`);
    }

    if (liveChat.isDeleted) {
      throw new BadRequestException('消息已经被删除');
    }

    liveChat.isReported = true;
    liveChat.reportCount += 1;

    return await this.liveChatRepository.save(liveChat);
  }

  /**
   * 获取被举报的消息列表
   */
  async getReportedMessages(paginationDto: PaginationDto): Promise<[LiveChat[], number]> {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    return await this.liveChatRepository.findAndCount({
      where: { 
        isReported: true,
        isDeleted: false 
      },
      order: { reportCount: 'DESC' },
      skip,
      take: limit,
      relations: ['liveRoom']
    });
  }

  /**
   * 发送礼物消息
   */
  async sendGiftMessage(createLiveChatDto: CreateLiveChatDto & {
    giftId: string;
    giftName: string;
    giftQuantity: number;
    giftValue: number;
  }): Promise<LiveChat> {
    // 验证直播间是否存在且正在直播
    const liveRoom = await this.liveRoomRepository.findOne({
      where: { id: createLiveChatDto.liveRoomId }
    });

    if (!liveRoom) {
      throw new NotFoundException(`直播间 ${createLiveChatDto.liveRoomId} 不存在`);
    }

    if (liveRoom.status !== 'LIVE') {
      throw new BadRequestException('直播间未在直播中，无法发送礼物');
    }

    const liveChat = this.liveChatRepository.create({
      ...createLiveChatDto,
      messageType: 'GIFT'
    });

    return await this.liveChatRepository.save(liveChat);
  }

  /**
   * 发送系统消息
   */
  async sendSystemMessage(liveRoomId: string, content: string): Promise<LiveChat> {
    // 验证直播间是否存在
    const liveRoom = await this.liveRoomRepository.findOne({
      where: { id: liveRoomId }
    });

    if (!liveRoom) {
      throw new NotFoundException(`直播间 ${liveRoomId} 不存在`);
    }

    const liveChat = this.liveChatRepository.create({
      liveRoomId,
      senderId: 'system',
      senderName: '系统消息',
      messageType: 'SYSTEM',
      content,
      isAnchorMessage: false,
      isAdminMessage: true
    });

    return await this.liveChatRepository.save(liveChat);
  }

  /**
   * 获取直播间消息统计
   */
  async getMessageStatistics(liveRoomId: string, startTime?: Date, endTime?: Date): Promise<{
    totalMessages: number;
    textMessages: number;
    giftMessages: number;
    systemMessages: number;
    imageMessages: number;
    reportedMessages: number;
    deletedMessages: number;
    anchorMessages: number;
    adminMessages: number;
  }> {
    const queryBuilder = this.liveChatRepository.createQueryBuilder('liveChat')
      .where('liveChat.liveRoomId = :liveRoomId', { liveRoomId });

    if (startTime && endTime) {
      queryBuilder.andWhere('liveChat.createTime BETWEEN :startTime AND :endTime', {
        startTime,
        endTime
      });
    }

    const messages = await queryBuilder.getMany();

    return {
      totalMessages: messages.length,
      textMessages: messages.filter(msg => msg.messageType === 'TEXT').length,
      giftMessages: messages.filter(msg => msg.messageType === 'GIFT').length,
      systemMessages: messages.filter(msg => msg.messageType === 'SYSTEM').length,
      imageMessages: messages.filter(msg => msg.messageType === 'IMAGE').length,
      reportedMessages: messages.filter(msg => msg.isReported).length,
      deletedMessages: messages.filter(msg => msg.isDeleted).length,
      anchorMessages: messages.filter(msg => msg.isAnchorMessage).length,
      adminMessages: messages.filter(msg => msg.isAdminMessage).length
    };
  }

  /**
   * 清空直播间聊天记录（管理员操作）
   */
  async clearChatHistory(liveRoomId: string, deletedBy: string): Promise<void> {
    const result = await this.liveChatRepository
      .createQueryBuilder()
      .update(LiveChat)
      .set({
        isDeleted: true,
        deletedBy,
        deletedTime: new Date(),
        deleteReason: '管理员清空聊天记录'
      })
      .where('liveRoomId = :liveRoomId', { liveRoomId })
      .andWhere('isDeleted = :isDeleted', { isDeleted: false })
      .execute();
  }

  /**
   * 恢复被删除的消息（管理员操作）
   */
  async restoreMessage(id: string): Promise<LiveChat> {
    const liveChat = await this.liveChatRepository.findOne({
      where: { id }
    });

    if (!liveChat) {
      throw new NotFoundException(`消息 ${id} 不存在`);
    }

    if (!liveChat.isDeleted) {
      throw new BadRequestException('消息未被删除');
    }

    liveChat.isDeleted = false;
    liveChat.deletedBy = null;
    liveChat.deletedTime = null;
    liveChat.deleteReason = null;

    return await this.liveChatRepository.save(liveChat);
  }
}