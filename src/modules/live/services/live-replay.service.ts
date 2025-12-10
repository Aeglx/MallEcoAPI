import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveReplay } from '../entities/live-replay.entity';

@Injectable()
export class LiveReplayService {
  constructor(
    @InjectRepository(LiveReplay)
    private readonly liveReplayRepository: Repository<LiveReplay>,
  ) {}

  /**
   * 创建直播回放
   */
  async createReplay(roomId: string, replayData: any): Promise<LiveReplay> {
    const replay = this.liveReplayRepository.create({
      ...replayData,
      roomId,
      createTime: new Date(),
      status: 'processing',
    });

    return await this.liveReplayRepository.save(replay);
  }

  /**
   * 获取直播回放列表
   */
  async getReplays(roomId: string, page: number = 1, size: number = 20): Promise<{ items: LiveReplay[], total: number, page: number, size: number }> {
    const [items, total] = await this.liveReplayRepository.findAndCount({
      where: { roomId },
      order: { createTime: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      items,
      total,
      page,
      size,
    };
  }

  /**
   * 获取回放详情
   */
  async getReplayDetail(replayId: string): Promise<LiveReplay> {
    return await this.liveReplayRepository.findOne({
      where: { id: replayId },
    });
  }

  /**
   * 删除回放
   */
  async deleteReplay(replayId: string): Promise<void> {
    await this.liveReplayRepository.delete(replayId);
  }

  /**
   * 更新回放状态
   */
  async updateReplayStatus(replayId: string, status: string, replayUrl?: string): Promise<void> {
    const updateData: any = { status };
    if (replayUrl) {
      updateData.replayUrl = replayUrl;
    }

    await this.liveReplayRepository.update(replayId, updateData);
  }

  /**
   * 获取热门回放列表
   */
  async getHotReplays(limit: number = 10): Promise<LiveReplay[]> {
    return await this.liveReplayRepository.find({
      where: { status: 'completed' },
      order: { viewCount: 'DESC' },
      take: limit,
    });
  }

  /**
   * 增加回放观看次数
   */
  async increaseViewCount(replayId: string): Promise<void> {
    await this.liveReplayRepository.increment(
      { id: replayId },
      'viewCount',
      1
    );
  }

  /**
   * 搜索回放
   */
  async searchReplays(keyword: string, page: number = 1, size: number = 20): Promise<{ items: LiveReplay[], total: number, page: number, size: number }> {
    const [items, total] = await this.liveReplayRepository.findAndCount({
      where: {
        title: new RegExp(keyword, 'i') as any,
        status: 'completed',
      },
      order: { createTime: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      items,
      total,
      page,
      size,
    };
  }
}