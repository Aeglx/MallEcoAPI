import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImTalkEntity } from '../entities/im-talk.entity';

/**
 * IM聊天服务
 */
@Injectable()
export class ImTalkService {
  constructor(
    @InjectRepository(ImTalkEntity)
    private readonly talkRepo: Repository<ImTalkEntity>,
  ) {}

  /**
   * 获取与某人的聊天框
   */
  async getTalkByUser(userId1: string, userId2: string): Promise<ImTalkEntity | null> {
    let talk = await this.talkRepo.findOne({
      where: [
        { userId1, userId2, deleteFlag: false },
        { userId1: userId2, userId2: userId1, deleteFlag: false },
      ],
    });

    if (!talk) {
      // 确保userId1 < userId2
      const [id1, id2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

      talk = this.talkRepo.create({
        userId1: id1,
        userId2: id2,
        name1: '',
        name2: '',
        face1: null,
        face2: null,
        top1: false,
        top2: false,
        disable1: false,
        disable2: false,
        storeFlag1: false,
        storeFlag2: false,
        lastTalkTime: new Date(),
      });

      talk = await this.talkRepo.save(talk);
    }

    return talk;
  }

  /**
   * 更新聊天最后消息
   */
  async updateLastMessage(talkId: string, message: string, messageType: string): Promise<void> {
    const talk = await this.talkRepo.findOne({ where: { id: Number(talkId) } });
    if (talk) {
      await this.talkRepo.update(talk.id, {
        lastTalkTime: new Date(),
        lastTalkMessage: message,
        lastMessageType: messageType,
      });
    }
  }

  /**
   * 置顶消息
   */
  async top(id: string, userId: string, top: boolean): Promise<void> {
    const talk = await this.talkRepo.findOne({ where: { id: Number(id) } });
    if (!talk) {
      throw new Error('聊天不存在');
    }

    if (talk.userId1 === userId) {
      await this.talkRepo.update(id, { top1: top });
    } else if (talk.userId2 === userId) {
      await this.talkRepo.update(id, { top2: top });
    }
  }

  /**
   * 禁用聊天
   */
  async disable(id: string, userId: string): Promise<void> {
    const talk = await this.talkRepo.findOne({ where: { id: Number(id) } });
    if (!talk) {
      throw new Error('聊天不存在');
    }

    if (talk.userId1 === userId) {
      await this.talkRepo.update(id, { disable1: true });
    } else if (talk.userId2 === userId) {
      await this.talkRepo.update(id, { disable2: true });
    }
  }

  /**
   * 获取用户聊天列表
   */
  async getUserTalkList(userId: string): Promise<ImTalkEntity[]> {
    return this.talkRepo.find({
      where: [
        { userId1: userId, disable1: false, deleteFlag: false },
        { userId2: userId, disable2: false, deleteFlag: false },
      ],
      order: { lastTalkTime: 'DESC' },
    });
  }
}
