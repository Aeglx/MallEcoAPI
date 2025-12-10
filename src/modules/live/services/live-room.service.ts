import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThan } from 'typeorm';
import { LiveRoom } from '../entities/live-room.entity';
import { LiveProduct } from '../entities/live-product.entity';
import { LiveStatusEnum } from '../enums/live-status.enum';
import { LiveRoomSearchParams, CreateLiveRoomDto } from '../dto/live-room-search.dto';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

@Injectable()
export class LiveRoomService {
  constructor(
    @InjectRepository(LiveRoom)
    private readonly liveRoomRepository: Repository<LiveRoom>,
    @InjectRepository(LiveProduct)
    private readonly liveProductRepository: Repository<LiveProduct>,
  ) {}

  /**
   * 创建直播间
   */
  async createLiveRoom(createDto: CreateLiveRoomDto, userId: string, storeId?: string): Promise<LiveRoom> {
    const liveRoom = this.liveRoomRepository.create({
      ...createDto,
      userId,
      storeId,
      status: LiveStatusEnum.NOT_STARTED,
    });

    const savedRoom = await this.liveRoomRepository.save(liveRoom);

    // 如果有商品，添加商品到直播间
    if (createDto.products && createDto.products.length > 0) {
      await this.addProductsToRoom(savedRoom.id, createDto.products);
    }

    return savedRoom;
  }

  /**
   * 获取直播间详情
   */
  async getLiveRoomById(id: string): Promise<LiveRoom> {
    return await this.liveRoomRepository.findOne({
      where: { id, deleteTime: null },
      relations: ['products'],
    });
  }

  /**
   * 获取用户的直播间列表
   */
  async getUserLiveRooms(
    userId: string,
    searchParams: LiveRoomSearchParams,
  ): Promise<PaginatedResult<LiveRoom>> {
    const {
      title,
      status,
      type,
      startTimeFrom,
      startTimeTo,
      enableChat,
      enableGift,
      page = 1,
      size = 10,
      sortBy = 'createTime',
      sortOrder = 'DESC',
    } = searchParams;

    const queryBuilder = this.liveRoomRepository
      .createQueryBuilder('liveRoom')
      .where('liveRoom.userId = :userId', { userId })
      .andWhere('liveRoom.deleteTime IS NULL');

    if (title) {
      queryBuilder.andWhere('liveRoom.title LIKE :title', { title: `%${title}%` });
    }

    if (status) {
      queryBuilder.andWhere('liveRoom.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('liveRoom.type = :type', { type });
    }

    if (startTimeFrom && startTimeTo) {
      queryBuilder.andWhere(
        'liveRoom.createTime BETWEEN :startTimeFrom AND :startTimeTo',
        { startTimeFrom, startTimeTo },
      );
    }

    if (enableChat !== undefined) {
      queryBuilder.andWhere('liveRoom.enableChat = :enableChat', { enableChat });
    }

    if (enableGift !== undefined) {
      queryBuilder.andWhere('liveRoom.enableGift = :enableGift', { enableGift });
    }

    const total = await queryBuilder.getCount();
    
    queryBuilder
      .orderBy(`liveRoom.${sortBy}`, sortOrder)
      .skip((page - 1) * size)
      .take(size);

    const items = await queryBuilder.getMany();

    return {
      items,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  /**
   * 获取直播间列表（管理员）
   */
  async getLiveRooms(
    searchParams: LiveRoomSearchParams,
  ): Promise<PaginatedResult<LiveRoom>> {
    const {
      title,
      userId,
      storeId,
      status,
      type,
      startTimeFrom,
      startTimeTo,
      enableChat,
      enableGift,
      page = 1,
      size = 10,
      sortBy = 'createTime',
      sortOrder = 'DESC',
    } = searchParams;

    const queryBuilder = this.liveRoomRepository
      .createQueryBuilder('liveRoom')
      .leftJoinAndSelect('liveRoom.user', 'user')
      .leftJoinAndSelect('liveRoom.store', 'store')
      .where('liveRoom.deleteTime IS NULL');

    if (title) {
      queryBuilder.andWhere('liveRoom.title LIKE :title', { title: `%${title}%` });
    }

    if (userId) {
      queryBuilder.andWhere('liveRoom.userId = :userId', { userId });
    }

    if (storeId) {
      queryBuilder.andWhere('liveRoom.storeId = :storeId', { storeId });
    }

    if (status) {
      queryBuilder.andWhere('liveRoom.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('liveRoom.type = :type', { type });
    }

    if (startTimeFrom && startTimeTo) {
      queryBuilder.andWhere(
        'liveRoom.createTime BETWEEN :startTimeFrom AND :startTimeTo',
        { startTimeFrom, startTimeTo },
      );
    }

    if (enableChat !== undefined) {
      queryBuilder.andWhere('liveRoom.enableChat = :enableChat', { enableChat });
    }

    if (enableGift !== undefined) {
      queryBuilder.andWhere('liveRoom.enableGift = :enableGift', { enableGift });
    }

    const total = await queryBuilder.getCount();
    
    queryBuilder
      .orderBy(`liveRoom.${sortBy}`, sortOrder)
      .skip((page - 1) * size)
      .take(size);

    const items = await queryBuilder.getMany();

    return {
      items,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  /**
   * 开始直播
   */
  async startLiveRoom(id: string, userId: string): Promise<LiveRoom> {
    const liveRoom = await this.liveRoomRepository.findOne({
      where: { id, userId, deleteTime: null },
    });

    if (!liveRoom) {
      throw new Error('直播间不存在或无权限');
    }

    if (liveRoom.status !== LiveStatusEnum.NOT_STARTED && liveRoom.status !== LiveStatusEnum.PAUSED) {
      throw new Error('直播间状态不允许开始');
    }

    liveRoom.status = LiveStatusEnum.LIVE;
    liveRoom.startTime = new Date();

    return await this.liveRoomRepository.save(liveRoom);
  }

  /**
   * 结束直播
   */
  async endLiveRoom(id: string, userId: string): Promise<LiveRoom> {
    const liveRoom = await this.liveRoomRepository.findOne({
      where: { id, userId, deleteTime: null },
    });

    if (!liveRoom) {
      throw new Error('直播间不存在或无权限');
    }

    if (liveRoom.status !== LiveStatusEnum.LIVE) {
      throw new Error('直播间未在直播中');
    }

    liveRoom.status = LiveStatusEnum.ENDED;
    liveRoom.endTime = new Date();

    // 计算直播时长
    if (liveRoom.startTime) {
      const duration = Math.floor((Date.now() - liveRoom.startTime.getTime()) / 1000 / 60);
      liveRoom.duration = duration;
    }

    return await this.liveRoomRepository.save(liveRoom);
  }

  /**
   * 暂停直播
   */
  async pauseLiveRoom(id: string, userId: string): Promise<LiveRoom> {
    const liveRoom = await this.liveRoomRepository.findOne({
      where: { id, userId, deleteTime: null },
    });

    if (!liveRoom) {
      throw new Error('直播间不存在或无权限');
    }

    if (liveRoom.status !== LiveStatusEnum.LIVE) {
      throw new Error('直播间未在直播中');
    }

    liveRoom.status = LiveStatusEnum.PAUSED;
    return await this.liveRoomRepository.save(liveRoom);
  }

  /**
   * 更新直播间观看人数
   */
  async updateViewerCount(id: string, viewerCount: number): Promise<void> {
    await this.liveRoomRepository.update(id, { viewerCount });
  }

  /**
   * 更新直播间统计数据
   */
  async updateLiveStats(id: string, stats: {
    likeCount?: number;
    giftCount?: number;
    salesAmount?: number;
    orderCount?: number;
  }): Promise<void> {
    await this.liveRoomRepository.update(id, stats);
  }

  /**
   * 删除直播间
   */
  async deleteLiveRoom(id: string, userId: string): Promise<void> {
    const liveRoom = await this.liveRoomRepository.findOne({
      where: { id, userId, deleteTime: null },
    });

    if (!liveRoom) {
      throw new Error('直播间不存在或无权限');
    }

    if (liveRoom.status === LiveStatusEnum.LIVE) {
      throw new Error('直播中的直播间无法删除');
    }

    liveRoom.deleteTime = new Date();
    await this.liveRoomRepository.save(liveRoom);
  }

  /**
   * 添加商品到直播间
   */
  private async addProductsToRoom(roomId: string, products: any[]): Promise<void> {
    const liveProducts = products.map(product => 
      this.liveProductRepository.create({
        ...product,
        roomId,
        isActive: true,
        addedTime: new Date(),
      })
    );

    await this.liveProductRepository.save(liveProducts);
  }
}