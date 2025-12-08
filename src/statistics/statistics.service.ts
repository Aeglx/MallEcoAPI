import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * 获取商品销售统计
   */
  async getProductStatistics() {
    const [totalProducts, totalStock, totalSales, avgPrice] = await Promise.all([
      this.productRepository.count(),
      this.productRepository.createQueryBuilder('product')
        .select('SUM(product.stock) as totalStock')
        .getRawOne(),
      this.productRepository.createQueryBuilder('product')
        .select('SUM(product.sales) as totalSales')
        .getRawOne(),
      this.productRepository.createQueryBuilder('product')
        .select('AVG(product.price) as avgPrice')
        .getRawOne(),
    ]);

    return {
      totalProducts,
      totalStock: totalStock.totalStock || 0,
      totalSales: totalSales.totalSales || 0,
      avgPrice: avgPrice.avgPrice || 0,
    };
  }

  /**
   * 获取热门商品
   */
  async getHotProducts(limit: number = 10) {
    return await this.productRepository.find({
      order: { sales: 'DESC' },
      take: limit,
    });
  }

  /**
   * 获取滞销商品
   */
  async getUnsoldProducts(limit: number = 10) {
    return await this.productRepository.find({
      where: { sales: 0, stock: MoreThanOrEqual(1) },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  /**
   * 获取系统概览数据
   */
  async getSystemOverview() {
    const productStats = await this.getProductStatistics();
    
    return {
      ...productStats,
      activeProducts: await this.productRepository.count({ where: { isShow: 1 } }),
      newProducts: await this.productRepository.count({ where: { isNew: 1 } }),
      hotProducts: await this.productRepository.count({ where: { isHot: 1 } }),
    };
  }
}
