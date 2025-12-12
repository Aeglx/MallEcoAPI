import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Seckill, SeckillGoods } from '../entities/seckill.entity';
import { SeckillCreateDto } from '../dto/seckill-create.dto';
import { CustomException } from '../../common/filters/custom-exception';
import { CodeEnum } from '../../common/enums/code.enum';

@Injectable()
export class SeckillService {
  constructor(
    @InjectRepository(Seckill)
    private seckillRepository: Repository<Seckill>,
    @InjectRepository(SeckillGoods)
    private seckillGoodsRepository: Repository<SeckillGoods>,
  ) {}

  /**
   * 创建秒杀活动
   */
  async createSeckill(createDto: SeckillCreateDto, createBy: string): Promise<Seckill> {
    // 生成活动编码
    const code = await this.generateSeckillCode();

    // 检查活动名称是否已存在
    const existing = await this.seckillRepository.findOne({
      where: { name: createDto.name, deleteFlag: 0 }
    });

    if (existing) {
      throw new CustomException(CodeEnum.SECKILL_NAME_EXISTS);
    }

    // 创建秒杀活动
    const seckill = this.seckillRepository.create({
      name: createDto.name,
      code,
      startTime: createDto.startTime,
      endTime: createDto.endTime,
      previewStartTime: createDto.previewStartTime,
      previewEndTime: createDto.previewEndTime,
      description: createDto.description,
      shareTitle: createDto.shareTitle,
      shareImage: createDto.shareImage,
      shareDescription: createDto.shareDescription,
      remark: createDto.remark,
      createBy,
      status: 0, // 未开始
    });

    const savedSeckill = await this.seckillRepository.save(seckill);

    // 创建秒杀商品
    for (const goodsDto of createDto.goods) {
      const seckillGoods = this.seckillGoodsRepository.create({
        seckillId: savedSeckill.id,
        productId: goodsDto.productId,
        productName: goodsDto.productId, // 应该从商品表获取
        productImage: '', // 应该从商品表获取
        originalPrice: 0, // 应该从商品表获取
        seckillPrice: goodsDto.seckillPrice,
        seckillStock: goodsDto.seckillStock,
        soldCount: 0,
        limitCount: goodsDto.limitCount || 0,
        sortOrder: goodsDto.sortOrder || 1,
        remark: goodsDto.remark,
      });

      await this.seckillGoodsRepository.save(seckillGoods);
    }

    return savedSeckill;
  }

  /**
   * 生成秒杀活动编码
   */
  private async generateSeckillCode(): Promise<string> {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SK${timestamp}${random}`;
  }

  /**
   * 分页查询秒杀活动
   */
  async getSeckills(query: {
    page?: number;
    limit?: number;
    name?: string;
    code?: string;
    status?: number;
    startTime?: Date;
    endTime?: Date;
    createBy?: string;
  }): Promise<{ items: Seckill[]; total: number }> {
    const { page = 1, limit = 10, name, code, status, startTime, endTime, createBy } = query;
    const skip = (page - 1) * limit;

    const whereCondition: any = { deleteFlag: 0 };

    if (name) {
      whereCondition.name = Like(`%${name}%`);
    }

    if (code) {
      whereCondition.code = Like(`%${code}%`);
    }

    if (status !== undefined) {
      whereCondition.status = status;
    }

    if (createBy) {
      whereCondition.createBy = createBy;
    }

    if (startTime && endTime) {
      whereCondition.createTime = Between(startTime, endTime);
    }

    const [items, total] = await this.seckillRepository.findAndCount({
      where: whereCondition,
      relations: ['goods'],
      order: { createTime: 'DESC' },
      skip,
      take: limit,
    });

    return { items, total };
  }

  /**
   * 获取秒杀活动详情
   */
  async getSeckillDetail(id: string): Promise<Seckill> {
    const seckill = await this.seckillRepository.findOne({
      where: { id, deleteFlag: 0 },
      relations: ['goods']
    });

    if (!seckill) {
      throw new CustomException(CodeEnum.SECKILL_NOT_FOUND);
    }

    // 更新活动状态
    const now = new Date();
    if (now < seckill.startTime) {
      seckill.status = 0; // 未开始
    } else if (now >= seckill.startTime && now <= seckill.endTime) {
      seckill.status = 1; // 进行中
    } else {
      seckill.status = 2; // 已结束
    }

    await this.seckillRepository.save(seckill);

    return seckill;
  }

  /**
   * 更新秒杀活动
   */
  async updateSeckill(
    id: string,
    updateDto: Partial<SeckillCreateDto>,
    updateBy: string
  ): Promise<Seckill> {
    const seckill = await this.getSeckillDetail(id);

    // 如果活动已开始，不能修改某些字段
    if (seckill.status === 1) {
      const allowedFields = ['description', 'shareTitle', 'shareImage', 'shareDescription', 'remark'];
      const updateKeys = Object.keys(updateDto);
      
      for (const key of updateKeys) {
        if (!allowedFields.includes(key)) {
          throw new CustomException(CodeEnum.SECKILL_CANNOT_UPDATE);
        }
      }
    }

    Object.assign(seckill, updateDto, {
      updateBy,
    });

    const savedSeckill = await this.seckillRepository.save(seckill);

    // 更新秒杀商品
    if (updateDto.goods) {
      // 先删除原有商品
      await this.seckillGoodsRepository.delete({
        seckillId: id
      });

      // 创建新商品
      for (const goodsDto of updateDto.goods) {
        const seckillGoods = this.seckillGoodsRepository.create({
          seckillId: id,
          productId: goodsDto.productId,
          productName: goodsDto.productId, // 应该从商品表获取
          productImage: '', // 应该从商品表获取
          originalPrice: 0, // 应该从商品表获取
          seckillPrice: goodsDto.seckillPrice,
          seckillStock: goodsDto.seckillStock,
          soldCount: 0,
          limitCount: goodsDto.limitCount || 0,
          sortOrder: goodsDto.sortOrder || 1,
          remark: goodsDto.remark,
        });

        await this.seckillGoodsRepository.save(seckillGoods);
      }
    }

    return savedSeckill;
  }

  /**
   * 删除秒杀活动
   */
  async deleteSeckill(id: string): Promise<void> {
    const seckill = await this.seckillRepository.findOne({
      where: { id, deleteFlag: 0 }
    });

    if (!seckill) {
      throw new CustomException(CodeEnum.SECKILL_NOT_FOUND);
    }

    // 如果活动已开始，不能删除
    if (seckill.status === 1) {
      throw new CustomException(CodeEnum.SECKILL_CANNOT_DELETE);
    }

    seckill.deleteFlag = 1;
    await this.seckillRepository.save(seckill);
  }

  /**
   * 获取当前进行中的秒杀活动
   */
  async getCurrentSeckills(): Promise<Seckill[]> {
    const now = new Date();
    
    const seckills = await this.seckillRepository.find({
      where: {
        status: 1,
        deleteFlag: 0,
        startTime: { $lte: now } as any,
        endTime: { $gte: now } as any,
      },
      relations: ['goods'],
      order: { createTime: 'DESC' },
    });

    return seckills;
  }

  /**
   * 获取预告中的秒杀活动
   */
  async getUpcomingSeckills(): Promise<Seckill[]> {
    const now = new Date();
    
    const seckills = await this.seckillRepository.find({
      where: {
        status: 0,
        deleteFlag: 0,
        startTime: { $gt: now } as any,
      },
      relations: ['goods'],
      order: { startTime: 'ASC' },
    });

    return seckills;
  }

  /**
   * 秒杀下单（减库存）
   */
  async seckillOrder(seckillGoodsId: string, quantity: number, memberId: string): Promise<boolean> {
    const seckillGoods = await this.seckillGoodsRepository.findOne({
      where: { id: seckillGoodsId, deleteFlag: 0 }
    });

    if (!seckillGoods) {
      throw new CustomException(CodeEnum.SECKILL_GOODS_NOT_FOUND);
    }

    // 检查库存
    if (seckillGoods.seckillStock < quantity) {
      throw new CustomException(CodeEnum.SECKILL_STOCK_INSUFFICIENT);
    }

    // 检查限购
    if (seckillGoods.limitCount > 0) {
      // 这里应该查询该用户已购买的数量
      // const purchasedCount = await this.getPurchasedCount(seckillGoodsId, memberId);
      // if (purchasedCount + quantity > seckillGoods.limitCount) {
      //   throw new CustomException(CodeEnum.SECKILL_LIMIT_EXCEEDED);
      // }
    }

    // 减少库存
    await this.seckillGoodsRepository.decrement(
      { id: seckillGoodsId },
      'seckillStock',
      quantity
    );

    // 增加已售数量
    await this.seckillGoodsRepository.increment(
      { id: seckillGoodsId },
      'soldCount',
      quantity
    );

    return true;
  }

  /**
   * 取消秒杀订单（回库存）
   */
  async cancelSeckillOrder(seckillGoodsId: string, quantity: number): Promise<void> {
    // 增加库存
    await this.seckillGoodsRepository.increment(
      { id: seckillGoodsId },
      'seckillStock',
      quantity
    );

    // 减少已售数量
    await this.seckillGoodsRepository.decrement(
      { id: seckillGoodsId },
      'soldCount',
      quantity
    );
  }

  /**
   * 启用/禁用秒杀活动
   */
  async toggleStatus(id: string, status: number): Promise<void> {
    const seckill = await this.seckillRepository.findOne({
      where: { id, deleteFlag: 0 }
    });

    if (!seckill) {
      throw new CustomException(CodeEnum.SECKILL_NOT_FOUND);
    }

    seckill.status = status;
    await this.seckillRepository.save(seckill);
  }

  /**
   * 获取秒杀活动统计
   */
  async getStatistics(query?: {
    startTime?: Date;
    endTime?: Date;
  }): Promise<any> {
    // 这里应该实现统计逻辑
    // 简化实现，实际应该查询相关表进行统计
    return {
      totalCount: 0,
      upcomingCount: 0,
      ongoingCount: 0,
      endedCount: 0,
      totalSales: 0,
      totalOrders: 0,
    };
  }
}