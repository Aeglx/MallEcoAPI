import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImTalk } from '../entities/im-talk.entity';
import { ImTalkQueryParams } from '../dto/im-talk.dto';

@Injectable()
export class ImTalkService {
  constructor(
    @InjectRepository(ImTalk) private readonly imTalkRepository: Repository<ImTalk>
  ) {}

  async getTalkByUser(userId1: string, userId2: string): Promise<ImTalk> {
    // 确保userId1总是较小的，这样能保证同一个对话始终被找到
    const [id1, id2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

    const talk = await this.imTalkRepository.findOne({
      where: {
        userId1: id1,
        userId2: id2
      }
    });

    return talk;
  }

  async createOrGetTalk(userId1: string, userId2: string, user1Info?: { name?: string; avatar?: string; isStore?: boolean }, user2Info?: { name?: string; avatar?: string; isStore?: boolean }): Promise<ImTalk> {
    let talk = await this.getTalkByUser(userId1, userId2);

    if (!talk) {
      // 确保userId1总是较小的
      const [id1, id2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
      const isFirstUserSmaller = userId1 < userId2;

      talk = this.imTalkRepository.create({
        userId1: id1,
        userId2: id2,
        name1: isFirstUserSmaller ? (user1Info?.name || '') : (user2Info?.name || ''),
        name2: isFirstUserSmaller ? (user2Info?.name || '') : (user1Info?.name || ''),
        face1: isFirstUserSmaller ? (user1Info?.avatar || '') : (user2Info?.avatar || ''),
        face2: isFirstUserSmaller ? (user2Info?.avatar || '') : (user1Info?.avatar || ''),
        storeFlag1: isFirstUserSmaller ? !!user1Info?.isStore : !!user2Info?.isStore,
        storeFlag2: isFirstUserSmaller ? !!user2Info?.isStore : !!user1Info?.isStore,
        lastTalkTime: new Date()
      });

      talk = await this.imTalkRepository.save(talk);
    }

    return talk;
  }

  async getTalkById(id: string): Promise<ImTalk> {
    const talk = await this.imTalkRepository.findOne({ where: { id: id } });
    if (!talk) {
      throw new NotFoundException('聊天会话不存在');
    }
    return talk;
  }

  async topTalk(id: string, top: boolean, userId: string): Promise<void> {
    const talk = await this.getTalkById(id);

    // 根据当前用户ID判断是更新top1还是top2
    if (talk.userId1 === userId) {
      talk.top1 = top;
    } else if (talk.userId2 === userId) {
      talk.top2 = top;
    }

    await this.imTalkRepository.save(talk);
  }

  async disableTalk(id: string, userId: string): Promise<void> {
    const talk = await this.getTalkById(id);

    // 根据当前用户ID判断是更新disable1还是disable2
    if (talk.userId1 === userId) {
      talk.disable1 = true;
    } else if (talk.userId2 === userId) {
      talk.disable2 = true;
    }

    await this.imTalkRepository.save(talk);
  }

  async getUserTalkList(userId: string, query: ImTalkQueryParams): Promise<{ data: ImTalk[]; total: number }> {
    const { page = 1, limit = 10, top, disable } = query;
    const skip = (page - 1) * limit;

    const qb = this.imTalkRepository.createQueryBuilder('talk');
    qb.where('(talk.userId1 = :userId AND talk.disable1 = :visible) OR (talk.userId2 = :userId AND talk.disable2 = :visible)', 
      { userId, visible: disable !== undefined ? disable : false });

    if (top !== undefined) {
      qb.andWhere('(talk.userId1 = :userId AND talk.top1 = :top) OR (talk.userId2 = :userId AND talk.top2 = :top)', { userId, top });
    }

    qb.orderBy('talk.top1', 'DESC')
      .addOrderBy('talk.top2', 'DESC')
      .addOrderBy('talk.lastTalkTime', 'DESC');

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return { data, total };
  }

  async updateLastTalkMessage(id: string, content: string, messageType: string): Promise<void> {
    await this.imTalkRepository.update(id, {
      lastTalkMessage: content,
      lastTalkTime: new Date(),
      lastMessageType: messageType
    });
  }

  async getStoreTalkList(storeId: string, query: ImTalkQueryParams): Promise<{ data: ImTalk[]; total: number }> {
    const { page = 1, limit = 10, top, disable } = query;
    const skip = (page - 1) * limit;

    const qb = this.imTalkRepository.createQueryBuilder('talk');
    qb.where('(talk.userId1 = :storeId AND talk.storeFlag1 = true AND talk.disable1 = :visible) OR (talk.userId2 = :storeId AND talk.storeFlag2 = true AND talk.disable2 = :visible)', 
      { storeId, visible: disable !== undefined ? disable : false });

    if (top !== undefined) {
      qb.andWhere('(talk.userId1 = :storeId AND talk.top1 = :top) OR (talk.userId2 = :storeId AND talk.top2 = :top)', { storeId, top });
    }

    qb.orderBy('talk.top1', 'DESC')
      .addOrderBy('talk.top2', 'DESC')
      .addOrderBy('talk.lastTalkTime', 'DESC');

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return { data, total };
  }
}