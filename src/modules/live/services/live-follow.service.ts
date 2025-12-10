import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveFollow } from '../entities/live-follow.entity';

@Injectable()
export class LiveFollowService {
  constructor(
    @InjectRepository(LiveFollow)
    private readonly liveFollowRepository: Repository<LiveFollow>,
  ) {}

  /**
   * 关注直播间
   */
  async followRoom(roomId: string, userId: string): Promise<LiveFollow> {
    // 检查是否已关注
    const existingFollow = await this.liveFollowRepository.findOne({
      where: { roomId, userId },
    });

    if (existingFollow) {
      throw new Error('已经关注该直播间');
    }

    const follow = this.liveFollowRepository.create({
      roomId,
      userId,
      followTime: new Date(),
    });

    return await this.liveFollowRepository.save(follow);
  }

  /**
   * 取消关注直播间
   */
  async unfollowRoom(roomId: string, userId: string): Promise<void> {
    const follow = await this.liveFollowRepository.findOne({
      where: { roomId, userId },
    });

    if (!follow) {
      throw new Error('未关注该直播间');
    }

    await this.liveFollowRepository.delete(follow.id);
  }

  /**
   * 获取用户关注的直播间列表
   */
  async getUserFollowedRooms(userId: string, page: number = 1, size: number = 20): Promise<{ items: LiveFollow[], total: number, page: number, size: number }> {
    const [items, total] = await this.liveFollowRepository.findAndCount({
      where: { userId },
      relations: ['room'],
      order: { followTime: 'DESC' },
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
   * 获取直播间粉丝列表
   */
  async getRoomFollowers(roomId: string, page: number = 1, size: number = 20): Promise<{ items: LiveFollow[], total: number, page: number, size: number }> {
    const [items, total] = await this.liveFollowRepository.findAndCount({
      where: { roomId },
      relations: ['user'],
      order: { followTime: 'DESC' },
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
   * 检查用户是否关注直播间
   */
  async isUserFollowingRoom(roomId: string, userId: string): Promise<boolean> {
    const follow = await this.liveFollowRepository.findOne({
      where: { roomId, userId },
    });

    return !!follow;
  }

  /**
   * 获取直播间粉丝数量
   */
  async getRoomFollowerCount(roomId: string): Promise<number> {
    return await this.liveFollowRepository.count({
      where: { roomId },
    });
  }

  /**
   * 获取用户关注数量
   */
  async getUserFollowCount(userId: string): Promise<number> {
    return await this.liveFollowRepository.count({
      where: { userId },
    });
  }
}