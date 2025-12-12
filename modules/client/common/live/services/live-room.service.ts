import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { LiveRoom } from '../entities/live-room.entity';
import { CreateLiveRoomDto } from '../dto/create-live-room.dto';
import { UpdateLiveRoomDto } from '../dto/update-live-room.dto';
import { LiveRoomPaginationDto } from '../dto/live-room-pagination.dto';

@Injectable()
export class LiveRoomService {
  constructor(
    @InjectRepository(LiveRoom)
    private readonly liveRoomRepository: Repository<LiveRoom>,
  ) {}

  /**
   * 创建直播�?
   */
  async create(createLiveRoomDto: CreateLiveRoomDto): Promise<LiveRoom> {
    const liveRoom = this.liveRoomRepository.create(createLiveRoomDto);
    return await this.liveRoomRepository.save(liveRoom);
  }

  /**
   * 分页查询直播间列�?
   */
  async findAll(paginationDto: LiveRoomPaginationDto): Promise<[LiveRoom[], number]> {
    const { page = 1, limit = 10, status, anchorId, keyword } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.liveRoomRepository.createQueryBuilder('liveRoom')
      .leftJoinAndSelect('liveRoom.liveGoods', 'liveGoods')
      .where('liveRoom.enabled = :enabled', { enabled: true });

    if (status) {
      queryBuilder.andWhere('liveRoom.status = :status', { status });
    }

    if (anchorId) {
      queryBuilder.andWhere('liveRoom.anchorId = :anchorId', { anchorId });
    }

    if (keyword) {
      queryBuilder.andWhere('(liveRoom.title LIKE :keyword OR liveRoom.anchorName LIKE :keyword)', 
        { keyword: `%${keyword}%` });
    }

    queryBuilder.orderBy('liveRoom.recommendationWeight', 'DESC')
      .addOrderBy('liveRoom.createTime', 'DESC')
      .skip(skip)
      .take(limit);

    return await queryBuilder.getManyAndCount();
  }

  /**
   * 根据ID查询直播间详�?
   */
  async findOne(id: string): Promise<LiveRoom> {
    const liveRoom = await this.liveRoomRepository.findOne({
      where: { id },
      relations: ['liveGoods', 'liveOrders', 'liveChats']
    });

    if (!liveRoom) {
      throw new NotFoundException(`直播�?${id} 不存在`);
    }

    return liveRoom;
  }

  /**
   * 更新直播间信�?
   */
  async update(id: string, updateLiveRoomDto: UpdateLiveRoomDto): Promise<LiveRoom> {
    const liveRoom = await this.findOne(id);
    
    Object.assign(liveRoom, updateLiveRoomDto);
    return await this.liveRoomRepository.save(liveRoom);
  }

  /**
   * 删除直播�?
   */
  async remove(id: string): Promise<void> {
    const liveRoom = await this.findOne(id);
    
    if (liveRoom.status === 'LIVE') {
      throw new BadRequestException('直播中的直播间不能删除');
    }

    await this.liveRoomRepository.remove(liveRoom);
  }

  /**
   * 开始直�?
   */
  async startLive(id: string): Promise<LiveRoom> {
    const liveRoom = await this.findOne(id);
    
    if (liveRoom.status !== 'PENDING') {
      throw new BadRequestException('只有待开始的直播间可以开始直播');
    }

    liveRoom.status = 'LIVE';
    liveRoom.actualStartTime = new Date();
    
    return await this.liveRoomRepository.save(liveRoom);
  }

  /**
   * 结束直播
   */
  async endLive(id: string): Promise<LiveRoom> {
    const liveRoom = await this.findOne(id);
    
    if (liveRoom.status !== 'LIVE') {
      throw new BadRequestException('只有直播中的直播间可以结束直播');
    }

    liveRoom.status = 'ENDED';
    liveRoom.endTime = new Date();
    
    return await this.liveRoomRepository.save(liveRoom);
  }

  /**
   * 暂停直播
   */
  async pauseLive(id: string): Promise<LiveRoom> {
    const liveRoom = await this.findOne(id);
    
    if (liveRoom.status !== 'LIVE') {
      throw new BadRequestException('只有直播中的直播间可以暂停');
    }

    liveRoom.status = 'PAUSED';
    return await this.liveRoomRepository.save(liveRoom);
  }

  /**
   * 恢复直播
   */
  async resumeLive(id: string): Promise<LiveRoom> {
    const liveRoom = await this.findOne(id);
    
    if (liveRoom.status !== 'PAUSED') {
      throw new BadRequestException('只有暂停中的直播间可以恢复');
    }

    liveRoom.status = 'LIVE';
    return await this.liveRoomRepository.save(liveRoom);
  }

  /**
   * 更新直播间统计数�?
   */
  async updateStatistics(id: string, statistics: {
    viewerCount?: number;
    likeCount?: number;
    salesAmount?: number;
    orderCount?: number;
  }): Promise<LiveRoom> {
    const liveRoom = await this.findOne(id);
    
    Object.assign(liveRoom, statistics);
    return await this.liveRoomRepository.save(liveRoom);
  }

  /**
   * 获取热门直播�?
   */
  async getHotLiveRooms(limit: number = 10): Promise<LiveRoom[]> {
    return await this.liveRoomRepository.find({
      where: { 
        status: 'LIVE',
        enabled: true 
      },
      order: {
        viewerCount: 'DESC',
        likeCount: 'DESC'
      },
      take: limit,
      relations: ['liveGoods']
    });
  }

  /**
   * 获取推荐直播�?
   */
  async getRecommendedLiveRooms(limit: number = 10): Promise<LiveRoom[]> {
    return await this.liveRoomRepository.find({
      where: { 
        isRecommended: true,
        enabled: true,
        status: In(['LIVE', 'PENDING'])
      },
      order: {
        recommendationWeight: 'DESC',
        scheduledStartTime: 'ASC'
      },
      take: limit,
      relations: ['liveGoods']
    });
  }

  /**
   * 根据主播ID获取直播间列�?
   */
  async findByAnchorId(anchorId: string, paginationDto: LiveRoomPaginationDto): Promise<[LiveRoom[], number]> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    return await this.liveRoomRepository.findAndCount({
      where: { anchorId },
      order: { createTime: 'DESC' },
      skip,
      take: limit,
      relations: ['liveGoods']
    });
  }
}
