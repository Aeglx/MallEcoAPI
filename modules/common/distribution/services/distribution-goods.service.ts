import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DistributionGoods } from '../entities/distribution-goods.entity';
import { Distribution } from '../entities/distribution.entity';
import { Product } from '../../product/entities/product.entity';
import { ApiException } from '../../../common/exceptions/api.exception';
import { ErrorCode } from '../../enums/error.enum';

@Injectable()
export class DistributionGoodsService {
  constructor(
    @InjectRepository(DistributionGoods)
    private readonly distributionGoodsRepository: Repository<DistributionGoods>,
    @InjectRepository(Distribution)
    private readonly distributionRepository: Repository<Distribution>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * 添加分销商品
   */
  async addDistributionGoods(data: {
    distributionId: string;
    productId: string;
    skuId?: string;
    commissionType: 'percentage' | 'fixed';
    firstCommission: number;
    secondCommission: number;
    thirdCommission?: number;
    minCommission?: number;
    maxCommission?: number;
    startTime?: Date;
    endTime?: Date;
    remark?: string;
  }): Promise<DistributionGoods> {
    // 验证分销员
    const distribution = await this.distributionRepository.findOne({
      where: { id: data.distributionId, status: 'approved' },
    });
    if (!distribution) {
      throw new ApiException(ErrorCode.DISTRIBUTION_NOT_FOUND);
    }

    // 验证商品
    const product = await this.productRepository.findOne({
      where: { id: data.productId },
    });
    if (!product) {
      throw new ApiException(ErrorCode.PRODUCT_NOT_FOUND);
    }

    // 检查是否已存在
    const existing = await this.distributionGoodsRepository.findOne({
      where: {
        distributionId: data.distributionId,
        productId: data.productId,
        skuId: data.skuId,
      },
    });
    if (existing) {
      throw new ApiException(ErrorCode.DISTRIBUTION_GOODS_ALREADY_EXISTS);
    }

    const distributionGoods = this.distributionGoodsRepository.create({
      ...data,
      status: 'active',
      totalSales: 0,
      totalCommission: 0,
      clickCount: 0,
      convertCount: 0,
      convertRate: 0,
    });

    return await this.distributionGoodsRepository.save(distributionGoods);
  }

  /**
   * 更新分销商品
   */
  async updateDistributionGoods(
    id: string,
    data: Partial<DistributionGoods>,
  ): Promise<DistributionGoods> {
    const distributionGoods = await this.distributionGoodsRepository.findOne({
      where: { id },
    });
    if (!distributionGoods) {
      throw new ApiException(ErrorCode.DISTRIBUTION_GOODS_NOT_FOUND);
    }

    Object.assign(distributionGoods, data);
    return await this.distributionGoodsRepository.save(distributionGoods);
  }

  /**
   * 删除分销商品
   */
  async deleteDistributionGoods(id: string): Promise<void> {
    const distributionGoods = await this.distributionGoodsRepository.findOne({
      where: { id },
    });
    if (!distributionGoods) {
      throw new ApiException(ErrorCode.DISTRIBUTION_GOODS_NOT_FOUND);
    }

    await this.distributionGoodsRepository.remove(distributionGoods);
  }

  /**
   * 获取分销商品详情
   */
  async getDistributionGoodsById(id: string): Promise<DistributionGoods> {
    const distributionGoods = await this.distributionGoodsRepository.findOne({
      where: { id },
      relations: ['distribution', 'product'],
    });
    if (!distributionGoods) {
      throw new ApiException(ErrorCode.DISTRIBUTION_GOODS_NOT_FOUND);
    }

    return distributionGoods;
  }

  /**
   * 获取分销员的商品列表
   */
  async getDistributionGoodsByDistributionId(
    distributionId: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
  ): Promise<[DistributionGoods[], number]> {
    const queryBuilder = this.distributionGoodsRepository
      .createQueryBuilder('goods')
      .leftJoinAndSelect('goods.product', 'product')
      .where('goods.distributionId = :distributionId', { distributionId });

    if (status) {
      queryBuilder.andWhere('goods.status = :status', { status });
    }

    queryBuilder
      .orderBy('goods.sortOrder', 'ASC')
      .addOrderBy('goods.createTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return await queryBuilder.getManyAndCount();
  }

  /**
   * 获取商品的分销信息
   */
  async getProductDistributionInfo(productId: string, distributionId?: string): Promise<DistributionGoods[]> {
    const queryBuilder = this.distributionGoodsRepository
      .createQueryBuilder('goods')
      .leftJoinAndSelect('goods.distribution', 'distribution')
      .where('goods.productId = :productId', { productId });

    if (distributionId) {
      queryBuilder.andWhere('goods.distributionId = :distributionId', { distributionId });
    } else {
      queryBuilder.andWhere('goods.status = :status', { status: 'active' });
    }

    return await queryBuilder.getMany();
  }

  /**
   * 批量添加分销商品
   */
  async batchAddDistributionGoods(
    distributionId: string,
    productIds: string[],
    commissionConfig: {
      commissionType: 'percentage' | 'fixed';
      firstCommission: number;
      secondCommission: number;
      thirdCommission?: number;
    },
  ): Promise<DistributionGoods[]> {
    const results: DistributionGoods[] = [];

    for (const productId of productIds) {
      try {
        const goods = await this.addDistributionGoods({
          distributionId,
          productId,
          ...commissionConfig,
        });
        results.push(goods);
      } catch (error) {
        // 跳过已存在的商品
        continue;
      }
    }

    return results;
  }

  /**
   * 更新商品统计信息
   */
  async updateGoodsStats(id: string, sales: number, commission: number): Promise<void> {
    await this.distributionGoodsRepository.manager.transaction(async manager => {
      await manager.increment(DistributionGoods, { id }, 'totalSales', sales);
      await manager.increment(DistributionGoods, { id }, 'totalCommission', commission);

      const goods = await manager.findOne(DistributionGoods, { where: { id } });
      if (goods && goods.clickCount > 0) {
        const convertRate = ((goods.convertCount + 1) / goods.clickCount) * 100;
        await manager.update(DistributionGoods, { id }, {
          convertCount: goods.convertCount + 1,
          convertRate: Math.round(convertRate * 100) / 100,
        });
      } else {
        await manager.increment(DistributionGoods, { id }, 'convertCount', 1);
      }
    });
  }

  /**
   * 更新点击统计
   */
  async updateClickStats(id: string): Promise<void> {
    await this.distributionGoodsRepository.manager.transaction(async manager => {
      await manager.increment(DistributionGoods, { id }, 'clickCount', 1);

      const goods = await manager.findOne(DistributionGoods, { where: { id } });
      if (goods && goods.clickCount > 0) {
        const convertRate = (goods.convertCount / goods.clickCount) * 100;
        await manager.update(DistributionGoods, { id }, {
          convertRate: Math.round(convertRate * 100) / 100,
        });
      }
    });
  }

  /**
   * 计算佣金
   */
  async calculateCommission(
    distributionGoodsId: string,
    orderAmount: number,
    level: number = 1,
  ): Promise<number> {
    const goods = await this.distributionGoodsRepository.findOne({
      where: { id: distributionGoodsId },
    });
    if (!goods) {
      throw new ApiException(ErrorCode.DISTRIBUTION_GOODS_NOT_FOUND);
    }

    let commission = 0;

    if (goods.commissionType === 'percentage') {
      switch (level) {
        case 1:
          commission = orderAmount * (goods.firstCommission / 100);
          break;
        case 2:
          commission = orderAmount * (goods.secondCommission / 100);
          break;
        case 3:
          commission = orderAmount * (goods.thirdCommission / 100);
          break;
      }
    } else {
      switch (level) {
        case 1:
          commission = goods.firstCommission;
          break;
        case 2:
          commission = goods.secondCommission;
          break;
        case 3:
          commission = goods.thirdCommission;
          break;
      }
    }

    // 检查最低佣金
    if (goods.minCommission > 0 && commission < goods.minCommission) {
      commission = goods.minCommission;
    }

    // 检查最高佣金
    if (goods.maxCommission && commission > goods.maxCommission) {
      commission = goods.maxCommission;
    }

    return commission;
  }

  /**
   * 获取热门分销商品
   */
  async getHotDistributionGoods(
    limit: number = 10,
    distributionId?: string,
  ): Promise<DistributionGoods[]> {
    const queryBuilder = this.distributionGoodsRepository
      .createQueryBuilder('goods')
      .leftJoinAndSelect('goods.product', 'product')
      .where('goods.status = :status', { status: 'active' })
      .andWhere('goods.totalSales > 0');

    if (distributionId) {
      queryBuilder.andWhere('goods.distributionId = :distributionId', { distributionId });
    }

    queryBuilder
      .orderBy('goods.totalSales', 'DESC')
      .addOrderBy('goods.totalCommission', 'DESC')
      .limit(limit);

    return await queryBuilder.getMany();
  }

  /**
   * 启用/禁用分销商品
   */
  async toggleGoodsStatus(id: string, status: 'active' | 'inactive'): Promise<DistributionGoods> {
    const goods = await this.distributionGoodsRepository.findOne({
      where: { id },
    });
    if (!goods) {
      throw new ApiException(ErrorCode.DISTRIBUTION_GOODS_NOT_FOUND);
    }

    goods.status = status;
    return await this.distributionGoodsRepository.save(goods);
  }

  /**
   * 更新排序
   */
  async updateSortOrder(id: string, sortOrder: number): Promise<void> {
    await this.distributionGoodsRepository.update({ id }, { sortOrder });
  }

  /**
   * 获取过期商品
   */
  async getExpiredGoods(): Promise<DistributionGoods[]> {
    const now = new Date();
    return await this.distributionGoodsRepository
      .createQueryBuilder('goods')
      .where('goods.status = :status', { status: 'active' })
      .andWhere('goods.endTime < :now', { now })
      .getMany();
  }

  /**
   * 批量禁用过期商品
   */
  async disableExpiredGoods(): Promise<void> {
    const now = new Date();
    await this.distributionGoodsRepository
      .createQueryBuilder()
      .update(DistributionGoods)
      .set({ status: 'inactive' })
      .where('status = :status', { status: 'active' })
      .andWhere('endTime < :now', { now })
      .execute();
  }
}