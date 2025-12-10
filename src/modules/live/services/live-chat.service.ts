import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { LiveChat } from '../entities/live-chat.entity';
import { CreateLiveChatDto } from '../dto/live-chat.dto';

@Injectable()
export class LiveChatService {
  constructor(
    @InjectRepository(LiveChat)
    private readonly liveChatRepository: Repository<LiveChat>,
  ) {}

  /**
   * 发送聊天消息
   */
  async sendChatMessage(createDto: CreateLiveChatDto, userId: string): Promise<LiveChat> {
    const chatMessage = this.liveChatRepository.create({
      ...createDto,
      userId,
      sendTime: new Date(),
    });

    return await this.liveChatRepository.save(chatMessage);
  }

  /**
   * 获取直播间聊天记录
   */
  async getChatHistory(roomId: string, page: number = 1, size: number = 50): Promise<{ items: LiveChat[], total: number, page: number, size: number }> {
    const [items, total] = await this.liveChatRepository.findAndCount({
      where: { roomId },
      order: { sendTime: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      items: items.reverse(), // 按时间正序排列
      total,
      page,
      size,
    };
  }

  /**
   * 获取未读消息数量
   */
  async getUnreadMessageCount(roomId: string, lastReadTime: Date): Promise<number> {
    return await this.liveChatRepository.count({
      where: {
        roomId,
        sendTime: MoreThan(lastReadTime),
      },
    });
  }

  /**
   * 删除聊天消息
   */
  async deleteChatMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.liveChatRepository.findOne({
      where: { id: messageId, userId },
    });

    if (!message) {
      throw new Error('消息不存在或无权限删除');
    }

    message.deleteTime = new Date();
    await this.liveChatRepository.save(message);
  }

  /**
   * 获取直播间在线用户列表
   */
  async getOnlineUsers(roomId: string): Promise<{ userId: string, joinTime: Date }[]> {
    // 实现获取在线用户逻辑
    // 这里可以结合Redis或WebSocket连接管理
    return [];
  }
}