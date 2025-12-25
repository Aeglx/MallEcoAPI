import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImMessageEntity } from '../entities/im-message.entity';

/**
 * IM消息服务
 */
@Injectable()
export class ImMessageService {
  constructor(
    @InjectRepository(ImMessageEntity)
    private readonly messageRepo: Repository<ImMessageEntity>,
  ) {}

  /**
   * 阅读消息
   */
  async read(talkId: string, userId: string): Promise<void> {
    await this.messageRepo.update(
      { talkId, toUser: userId, isRead: false },
      { isRead: true },
    );
  }

  /**
   * 未读消息列表
   */
  async unReadMessages(userId: string): Promise<ImMessageEntity[]> {
    return this.messageRepo.find({
      where: { toUser: userId, isRead: false, deleteFlag: false },
      order: { createTime: 'DESC' },
    });
  }

  /**
   * 历史消息
   */
  async historyMessage(userId: string, to: string, limit: number = 50): Promise<ImMessageEntity[]> {
    return this.messageRepo
      .createQueryBuilder('message')
      .where(
        '(message.fromUser = :userId AND message.toUser = :to) OR (message.fromUser = :to AND message.toUser = :userId)',
        { userId, to },
      )
      .andWhere('message.deleteFlag = :deleteFlag', { deleteFlag: false })
      .orderBy('message.createTime', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * 是否有新消息
   */
  async hasNewMessage(userId: string): Promise<boolean> {
    const count = await this.messageRepo.count({
      where: { toUser: userId, isRead: false, deleteFlag: false },
    });
    return count > 0;
  }

  /**
   * 发送消息
   */
  async sendMessage(message: Partial<ImMessageEntity>): Promise<ImMessageEntity> {
    const entity = this.messageRepo.create(message);
    return await this.messageRepo.save(entity);
  }

  /**
   * 获取未读消息数量
   */
  async unreadMessageCount(userId: string): Promise<number> {
    return this.messageRepo.count({
      where: { toUser: userId, isRead: false, deleteFlag: false },
    });
  }

  /**
   * 清空所有未读消息
   */
  async cleanUnreadMessage(userId: string): Promise<void> {
    await this.messageRepo.update(
      { toUser: userId, isRead: false },
      { isRead: true },
    );
  }
}

