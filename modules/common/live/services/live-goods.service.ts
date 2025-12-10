import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveGoods } from '../entities/live-goods.entity';
import { LiveRoom } from '../entities/live-room.entity';
import { CreateLiveGoodsDto } from '../dto/create-live-goods.dto';
import { UpdateLiveGoodsDto } from '../dto/update-live-goods.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class LiveGoodsService {
  constructor(
    @InjectRepository(LiveGoods)
    private readonly liveGoodsRepository: Repository<LiveGoods>,
    @InjectRepository(LiveRoom)
    private readonly liveRoomRepository: Repository<LiveRoom>,
  ) {}

  /**
   * 创建直播商品
   */
  async create(createLiveGoodsDto: CreateLiveGoodsDto): Promise<LiveGoods> {
    // 验证直播间是否存在
    const liveRoom = await this.liveRoomRepository.findOne({
      where: { id: createLiveGoodsDto.liveRoomId }
    });

    if (!liveRoom) {
      throw new NotFoundException(`直播间 ${createLiveGoodsDto.liveRoomId} 不存在`);
    }

    const liveGoods = this.liveGoodsRepository.create(createLiveGoodsDto);
    return await this.liveGoodsRepository.save(liveGoods);
  }

  /**
   * 分页查询直播商品列表
   */
  async findAll(paginationDto: PaginationDto): Promise<[LiveGoods[], number]> {
    const { page = 1, limit = 10, liveRoomId, isOnSale, keyword } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.liveGoodsRepository.createQueryBuilder('liveGoods')
      .leftJoinAndSelect('liveGoods.liveRoom', 'liveRoom');

    if (liveRoomId) {
      queryBuilder.andWhere('liveGoods.liveRoomId = :liveRoomId', { liveRoomId });
    }

    if (isOnSale !== undefined) {
      queryBuilder.andWhere('liveGoods.isOnSale = :isOnSale', { isOnSale });
    }

    if (keyword) {
      queryBuilder.andWhere('(liveGoods.goodsName LIKE :keyword OR liveGoods.description LIKE :keyword)', 
        { keyword: `%${keyword}%` });
    }

    queryBuilder.orderBy('liveGoods.sortWeight', 'DESC')
      .addOrderBy('liveGoods.onSaleTime', 'DESC')
      .skip(skip)
      .take(limit);

    return await queryBuilder.getManyAndCount();
  }

  /**
   * 根据ID查询直播商品详情
   */
  async findOne(id: string): Promise<LiveGoods> {
    const liveGoods = await this.liveGoodsRepository.findOne({
      where: { id },
      relations: ['liveRoom']
    });

    if (!liveGoods) {
      throw new NotFoundException(`直播商品 ${id} 不存在`);
    }

    return liveGoods;
  }

  /**
   * 更新直播商品信息
   */
  async update(id: string, updateLiveGoodsDto: UpdateLiveGoodsDto): Promise<LiveGoods> {
    const liveGoods = await this.findOne(id);
    
    Object.assign(liveGoods, updateLiveGoodsDto);
    return await this.liveGoodsRepository.save(liveGoods);
  }

  /**
   * 删除直播商品
   */
  async remove(id: string): Promise<void> {
    const liveGoods = await this.findOne(id);
    await this.liveGoodsRepository.remove(liveGoods);
  }

  /**
   * 上架直播商品
   */
  async onSale(id: string): Promise<LiveGoods> {
    const liveGoods = await this.findOne(id);
    
    if (liveGoods.isOnSale) {
      throw new BadRequestException('商品已经上架');
    }

    liveGoods.isOnSale = true;
    liveGoods.onSaleTime = new Date();
    
    return await this.liveGoodsRepository.save(liveGoods);
  }

  /**
   * 下架直播商品
   */
  async offSale(id: string): Promise<LiveGoods> {
    const liveGoods = await this.findOne(id);
    
    if (!liveGoods.isOnSale) {
      throw new BadRequestException('商品已经下架');
    }

    liveGoods.isOnSale = false;
    liveGoods.offSaleTime = new Date();
    
    return await this.liveGoodsRepository.save(liveGoods);
  }

  /**
   * 更新商品库存
   */
  async updateStock(id: string, quantity: number, operation: 'increase' | 'decrease' | 'set'): Promise<LiveGoods> {
    const liveGoods = await this.findOne(id);
    
    switch (operation) {
      case 'increase':
        liveGoods.liveStock += quantity;
        liveGoods.remainingStock += quantity;
        break;
      case 'decrease':
        if (liveGoods.remainingStock < quantity) {
          throw new BadRequestException('库存不足');
        }
        liveGoods.liveStock -= quantity;
        liveGoods.remainingStock -= quantity;
        break;
      case 'set':
        if (quantity < liveGoods.soldCount) {
          throw new BadRequestException('设置库存不能小于已售数量');
        }
        liveGoods.liveStock = quantity;
        liveGoods.remainingStock = quantity - liveGoods.soldCount;
        break;
    }
    
    return await this.liveGoodsRepository.save(liveGoods);
  }

  /**
   * 更新销售数量
   */
  async updateSales(id: string, quantity: number): Promise<LiveGoods> {
    const liveGoods = await this.findOne(id);
    
    if (liveGoods.remainingStock < quantity) {
      throw new BadRequestException('库存不足');
    }

    liveGoods.soldCount += quantity;
    liveGoods.remainingStock -= quantity;
    
    return await this.liveGoodsRepository.save(liveGoods);
  }

  /**
   * 根据直播间ID获取商品列表
   */
  async findByLiveRoomId(liveRoomId: string, paginationDto: PaginationDto): Promise<[LiveGoods[], number]> {
    const { page = 1, limit = 10, isOnSale } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.liveGoodsRepository.createQueryBuilder('liveGoods')
      .where('liveGoods.liveRoomId = :liveRoomId', { liveRoomId });

    if (isOnSale !== undefined) {
      queryBuilder.andWhere('liveGoods.isOnSale = :isOnSale', { isOnSale });
    }

    queryBuilder.orderBy('liveGoods.isMainGoods', 'DESC')
      .addOrderBy('liveGoods.sortWeight', 'DESC')
      .skip(skip)
      .take(limit);

    return await queryBuilder.getManyAndCount();
  }

  /**
   * 获取主推商品
   */
  async getMainGoodsByLiveRoomId(liveRoomId: string): Promise<LiveGoods[]> {
    return await this.liveGoodsRepository.find({
      where: { 
        liveRoomId,
        isMainGoods: true,
        isOnSale: true 
      },
      order: {
        sortWeight: 'DESC',
        onSaleTime: 'DESC'
      },
      take: 5
    });
  }

  /**
   * 批量更新商品排序
   */
  async batchUpdateSort(goodsList: Array<{ id: string; sortWeight: number }>): Promise<void> {
    const updatePromises = goodsList.map(async (goods) => {
      await this.liveGoodsRepository.update(goods.id, { 
        sortWeight: goods.sortWeight 
      });
    });

    await Promise.all(updatePromises);
  }
}