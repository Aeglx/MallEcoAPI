import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveRoom } from './entities/live-room.entity';
import { LiveGoods } from './entities/live-goods.entity';
import { LiveStatistics } from './entities/live-statistics.entity';
import { CreateLiveRoomDto } from './dto/create-live-room.dto';
import { UpdateLiveRoomDto } from './dto/update-live-room.dto';

@Injectable()
export class LiveService {
  constructor(
    @InjectRepository(LiveRoom) private liveRoomRepository: Repository<LiveRoom>,
    @InjectRepository(LiveGoods) private liveGoodsRepository: Repository<LiveGoods>,
    @InjectRepository(LiveStatistics) private liveStatisticsRepository: Repository<LiveStatistics>,
  ) {}

  /**
   * 创建直播间
   */
  async createLiveRoom(createLiveRoomDto: CreateLiveRoomDto): Promise<LiveRoom> {
    const liveRoom = this.liveRoomRepository.create(createLiveRoomDto);
    return this.liveRoomRepository.save(liveRoom);
  }

  /**
   * 获取直播间列表
   */
  async getLiveRooms(
    page: number = 1,
    pageSize: number = 10,
    status?: number,
  ): Promise<{ items: LiveRoom[]; total: number }> {
    const query = this.liveRoomRepository.createQueryBuilder('room');

    if (status !== undefined) {
      query.where('room.status = :status', { status });
    }

    query.orderBy('room.createTime', 'DESC');
    const [items, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total };
  }

  /**
   * 根据ID获取直播间
   */
  async getLiveRoomById(id: string): Promise<LiveRoom> {
    const liveRoom = await this.liveRoomRepository.findOne({ where: { id } });
    if (!liveRoom) {
      throw new NotFoundException('直播间不存在');
    }
    return liveRoom;
  }

  /**
   * 更新直播间
   */
  async updateLiveRoom(id: string, updateLiveRoomDto: UpdateLiveRoomDto): Promise<LiveRoom> {
    const liveRoom = await this.getLiveRoomById(id);
    Object.assign(liveRoom, updateLiveRoomDto);
    return this.liveRoomRepository.save(liveRoom);
  }

  /**
   * 删除直播间
   */
  async deleteLiveRoom(id: string): Promise<void> {
    const result = await this.liveRoomRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('直播间不存在');
    }
  }

  /**
   * 获取直播统计数据
   */
  async getLiveStatistics(roomId: string): Promise<LiveStatistics[]> {
    return this.liveStatisticsRepository.find({
      where: { liveRoomId: roomId },
      order: { date: 'DESC' },
      take: 30, // 获取最近30天数据
    });
  }
}
