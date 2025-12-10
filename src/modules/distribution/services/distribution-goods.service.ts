import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { DistributionGoods } from '../entities/distribution-goods.entity';
import { DistributionGoodsSearchParams } from '../dto/distribution-goods-search.dto';

@Injectable()
export class DistributionGoodsService {
  constructor(
    @InjectRepository(DistributionGoods)
    private distributionGoodsRepository: Repository<DistributionGoods>,
  ) {}

  /**
   * 创建分销商品
   */
  async createDistributionGoods(goodsData: Partial<DistributionGoods>): Promise<DistributionGoods> {
    // 检查是否已存在该SKU的分销设置
    const existing = await this.distributionGoodsRepository.findOne({
      where: { 
        skuId: goodsData.skuId, 
        deleteFlag: false 
      }
    });

    if (existing) {
      throw new BadRequestException('该商品已设置为分销商品');
    }

    const distributionGoods = new DistributionGoods();
    Object.assign(distributionGoods, goodsData);

    return await this.distributionGoodsRepository.save(distributionGoods);
  }

  /**
   * 批量创建分销商品
   */
  async createBatchDistributionGoods(goodsList: Partial<DistributionGoods>[]): Promise<DistributionGoods[]> {
    const distributionGoods = goodsList.map(goods => {
      const distributionGoods = new DistributionGoods();
      Object.assign(distributionGoods, goods);
      return distributionGoods;
    });

    return await this.distributionGoodsRepository.save(distributionGoods);
  }

  /**
   * 更新分销商品
   */
  async updateDistributionGoods(id: string, updateData: Partial<DistributionGoods>): Promise<DistributionGoods> {
    const distributionGoods = await this.distributionGoodsRepository.findOne({
      where: { id, deleteFlag: false }
    });

    if (!distributionGoods) {
      throw new NotFoundException('分销商品不存在');
    }

    Object.assign(distributionGoods, updateData);
    return await this.distributionGoodsRepository.save(distributionGoods);
  }

  /**
   * 删除分销商品
   */
  async deleteDistributionGoods(id: string): Promise<void> {
    const distributionGoods = await this.distributionGoodsRepository.findOne({
      where: { id, deleteFlag: false }
    });

    if (!distributionGoods) {
      throw new NotFoundException('分销商品不存在');
    }

    distributionGoods.deleteFlag = true;
    await this.distributionGoodsRepository.save(distributionGoods);
  }

  /**
   * 根据ID获取分销商品
   */
  async getDistributionGoodsById(id: string): Promise<DistributionGoods> {
    const distributionGoods = await this.distributionGoodsRepository.findOne({
      where: { id, deleteFlag: false }
    });

    if (!distributionGoods) {
      throw new NotFoundException('分销商品不存在');
    }

    return distributionGoods;
  }

  /**
   * 根据SKU获取分销商品
   */
  async getDistributionGoodsBySkuId(skuId: string): Promise<DistributionGoods> {
    const distributionGoods = await this.distributionGoodsRepository.findOne({
      where: { skuId, deleteFlag: false }
    });

    return distributionGoods;
  }

  /**
   * 分页查询分销商品列表
   */
  async getDistributionGoodsList(searchParams: DistributionGoodsSearchParams): Promise<{ items: DistributionGoods[], total: number }> {
    const { 
      storeId, 
      goodsName, 
      goodsId, 
      skuId, 
      minCommission, 
      maxCommission, 
      page = 1, 
      pageSize = 10 
    } = searchParams;

    const queryBuilder = this.distributionGoodsRepository
      .createQueryBuilder('distributionGoods')
      .where('distributionGoods.deleteFlag = :deleteFlag', { deleteFlag: false });

    if (storeId) {
      queryBuilder.andWhere('distributionGoods.storeId = :storeId', { storeId });
    }

    if (goodsName) {
      queryBuilder.andWhere('distributionGoods.goodsName LIKE :goodsName', { 
        goodsName: `%${goodsName}%` 
      });
    }

    if (goodsId) {
      queryBuilder.andWhere('distributionGoods.goodsId = :goodsId', { goodsId });
    }

    if (skuId) {
      queryBuilder.andWhere('distributionGoods.skuId = :skuId', { skuId });
    }

    if (minCommission !== undefined) {
      queryBuilder.andWhere('distributionGoods.commission >= :minCommission', { minCommission });
    }

    if (maxCommission !== undefined) {
      queryBuilder.andWhere('distributionGoods.commission <= :maxCommission', { maxCommission });
    }

    const [items, total] = await queryBuilder
      .orderBy('distributionGoods.createTime', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total };
  }

  /**
   * 获取店铺的分销商品列表
   */
  async getDistributionGoodsByStoreId(storeId: string): Promise<DistributionGoods[]> {
    return await this.distributionGoodsRepository.find({
      where: { storeId, deleteFlag: false },
      order: { createTime: 'DESC' }
    });
  }

  /**
   * 根据商品ID获取分销商品列表
   */
  async getDistributionGoodsByGoodsId(goodsId: string): Promise<DistributionGoods[]> {
    return await this.distributionGoodsRepository.find({
      where: { goodsId, deleteFlag: false },
      order: { createTime: 'DESC' }
    });
  }

  /**
   * 检查SKU是否为分销商品
   */
  async isDistributionGoods(skuId: string): Promise<boolean> {
    const count = await this.distributionGoodsRepository.count({
      where: { skuId, deleteFlag: false }
    });
    
    return count > 0;
  }

  /**
   * 获取分销商品统计信息
   */
  async getDistributionGoodsStatistics(): Promise<any> {
    const totalCount = await this.distributionGoodsRepository.count({
      where: { deleteFlag: false }
    });

    // TODO: 可以添加更多统计信息
    return {
      totalCount
    };
  }
}