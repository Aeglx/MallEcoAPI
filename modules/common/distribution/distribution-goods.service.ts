import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { DistributionGoods } from './entities/distribution-goods.entity';
import { DistributionGoodsCreateDto, DistributionType } from './dto/distribution-goods-create.dto';
import { Product } from '../product/entities/product.entity';
import { Store } from '../store/entities/store.entity';
import { CustomException } from '../../common/filters/custom-exception';
import { CodeEnum } from '../../common/enums/code.enum';

@Injectable()
export class DistributionGoodsService {
  constructor(
    @InjectRepository(DistributionGoods)
    private distributionGoodsRepository: Repository<DistributionGoods>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  /**
   * 创建分销商品
   */
  async createDistributionGoods(createDto: DistributionGoodsCreateDto, storeId: string, storeName: string): Promise<DistributionGoods> {
    // 检查商品是否存在
    const product = await this.productRepository.findOne({
      where: { id: createDto.productId }
    });
    
    if (!product) {
      throw new CustomException(CodeEnum.PRODUCT_NOT_FOUND);
    }

    // 检查是否已经是分销商品
    const existingDistributionGoods = await this.distributionGoodsRepository.findOne({
      where: { productId: createDto.productId, deleteFlag: 0 }
    });

    if (existingDistributionGoods) {
      throw new CustomException(CodeEnum.DISTRIBUTION_GOODS_ALREADY_EXISTS);
    }

    const distributionGoods = this.distributionGoodsRepository.create({
      productId: createDto.productId,
      productName: product.name,
      productImage: product.images?.[0],
      storeId,
      storeName,
      categoryId: product.categoryId,
      brandId: product.brandId,
      distributionType: createDto.distributionType,
      distributionAmount: createDto.distributionAmount,
      distributionRate: createDto.distributionRate,
      level1Commission: createDto.level1Commission,
      level2Commission: createDto.level2Commission,
      level3Commission: createDto.level3Commission,
      selfCommission: createDto.selfCommission,
      minCommission: createDto.minCommission,
      maxCommission: createDto.maxCommission,
      startTime: createDto.startTime,
      endTime: createDto.endTime,
      sortOrder: createDto.sortOrder,
      remark: createDto.remark,
      status: 1, // 默认启用
    });

    return await this.distributionGoodsRepository.save(distributionGoods);
  }

  /**
   * 更新分销商品
   */
  async updateDistributionGoods(id: string, updateDto: Partial<DistributionGoodsCreateDto>): Promise<DistributionGoods> {
    const distributionGoods = await this.distributionGoodsRepository.findOne({
      where: { id, deleteFlag: 0 }
    });

    if (!distributionGoods) {
      throw new CustomException(CodeEnum.DISTRIBUTION_GOODS_NOT_FOUND);
    }

    // 如果商品ID变更，需要检查商品是否存在
    if (updateDto.productId && updateDto.productId !== distributionGoods.productId) {
      const product = await this.productRepository.findOne({
        where: { id: updateDto.productId }
      });
      
      if (!product) {
        throw new CustomException(CodeEnum.PRODUCT_NOT_FOUND);
      }

      // 检查新商品是否已经是分销商品
      const existingGoods = await this.distributionGoodsRepository.findOne({
        where: { productId: updateDto.productId, deleteFlag: 0 }
      });

      if (existingGoods && existingGoods.id !== id) {
        throw new CustomException(CodeEnum.DISTRIBUTION_GOODS_ALREADY_EXISTS);
      }

      distributionGoods.productId = updateDto.productId;
      distributionGoods.productName = product.name;
      distributionGoods.productImage = product.images?.[0];
    }

    // 更新其他字段
    Object.keys(updateDto).forEach(key => {
      if (key !== 'productId') {
        distributionGoods[key] = updateDto[key];
      }
    });

    return await this.distributionGoodsRepository.save(distributionGoods);
  }

  /**
   * 删除分销商品
   */
  async deleteDistributionGoods(id: string): Promise<void> {
    const distributionGoods = await this.distributionGoodsRepository.findOne({
      where: { id, deleteFlag: 0 }
    });

    if (!distributionGoods) {
      throw new CustomException(CodeEnum.DISTRIBUTION_GOODS_NOT_FOUND);
    }

    distributionGoods.deleteFlag = 1;
    await this.distributionGoodsRepository.save(distributionGoods);
  }

  /**
   * 获取分销商品列表
   */
  async getDistributionGoodsList(query: any): Promise<{ items: DistributionGoods[]; total: number }> {
    const { page = 1, limit = 20, keyword, categoryId, storeId, status, sortBy = 'create_time', sortOrder = 'DESC' } = query;

    const whereCondition: any = { deleteFlag: 0 };

    if (keyword) {
      whereCondition.productName = Like(`%${keyword}%`);
    }
    if (categoryId) {
      whereCondition.categoryId = categoryId;
    }
    if (storeId) {
      whereCondition.storeId = storeId;
    }
    if (status !== undefined) {
      whereCondition.status = status;
    }

    const [items, total] = await this.distributionGoodsRepository.findAndCount({
      where: whereCondition,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  /**
   * 获取分销商品详情
   */
  async getDistributionGoodsDetail(id: string): Promise<DistributionGoods> {
    const distributionGoods = await this.distributionGoodsRepository.findOne({
      where: { id, deleteFlag: 0 },
      relations: ['product', 'store'],
    });

    if (!distributionGoods) {
      throw new CustomException(CodeEnum.DISTRIBUTION_GOODS_NOT_FOUND);
    }

    return distributionGoods;
  }

  /**
   * 更新分销商品状态
   */
  async updateDistributionGoodsStatus(id: string, status: number): Promise<DistributionGoods> {
    const distributionGoods = await this.distributionGoodsRepository.findOne({
      where: { id, deleteFlag: 0 }
    });

    if (!distributionGoods) {
      throw new CustomException(CodeEnum.DISTRIBUTION_GOODS_NOT_FOUND);
    }

    distributionGoods.status = status;
    distributionGoods.updateTime = new Date();

    return await this.distributionGoodsRepository.save(distributionGoods);
  }

  /**
   * 计算佣金
   */
  async calculateCommission(productId: string, orderAmount: number, distributionLevel: number = 1): Promise<number> {
    const distributionGoods = await this.distributionGoodsRepository.findOne({
      where: { 
        productId, 
        status: 1,
        deleteFlag: 0,
        startTime: new Date() as any,
        endTime: new Date() as any,
      }
    });

    if (!distributionGoods) {
      return 0;
    }

    let commission = 0;

    if (distributionGoods.distributionType === DistributionType.RATE) {
      // 按比例计算
      const rate = this.getCommissionRateByLevel(distributionGoods, distributionLevel);
      commission = orderAmount * (rate / 100);
    } else {
      // 按固定金额
      commission = distributionGoods.distributionAmount;
    }

    // 检查最低和最高佣金限制
    if (distributionGoods.minCommission && commission < distributionGoods.minCommission) {
      commission = distributionGoods.minCommission;
    }
    if (distributionGoods.maxCommission && commission > distributionGoods.maxCommission) {
      commission = distributionGoods.maxCommission;
    }

    return Math.round(commission * 100) / 100; // 保留两位小数
  }

  /**
   * 根据层级获取佣金比例
   */
  private getCommissionRateByLevel(distributionGoods: DistributionGoods, level: number): number {
    switch (level) {
      case 1:
        return distributionGoods.level1Commission;
      case 2:
        return distributionGoods.level2Commission;
      case 3:
        return distributionGoods.level3Commission;
      default:
        return 0;
    }
  }

  /**
   * 更新分销商品统计
   */
  async updateDistributionGoodsStats(productId: string, salesAmount: number, commissionAmount: number): Promise<void> {
    await this.distributionGoodsRepository.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.increment(
        { productId, deleteFlag: 0 },
        'totalSales',
        salesAmount
      );
      await transactionalEntityManager.increment(
        { productId, deleteFlag: 0 },
        'totalCommission',
        commissionAmount
      );
      await transactionalEntityManager.increment(
        { productId, deleteFlag: 0 },
        'distributionCount',
        1
      );
    });
  }

  /**
   * 增加点击次数
   */
  async incrementClickCount(productId: string): Promise<void> {
    await this.distributionGoodsRepository.increment(
      { productId, deleteFlag: 0 },
      'clickCount',
      1
    );
  }

  /**
   * 增加分享次数
   */
  async incrementShareCount(productId: string): Promise<void> {
    await this.distributionGoodsRepository.increment(
      { productId, deleteFlag: 0 },
      'shareCount',
      1
    );
  }
}