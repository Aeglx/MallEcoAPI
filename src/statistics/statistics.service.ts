import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection, MoreThanOrEqual } from 'typeorm';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  /**
   * 获取商品销售统计
   */
  async getProductStatistics() {
    const [
      totalProducts,
      totalStock,
      totalSales,
      avgPrice,
      activeProducts,
      newProducts,
      hotProducts,
    ] = await Promise.all([
      this.productRepository.count(),
      this.productRepository.sum('stock', {}),
      this.productRepository.sum('sales', {}),
      this.productRepository.average('price', {}),
      this.productRepository.count({ where: { isShow: 1 } }),
      this.productRepository.count({ where: { isNew: 1 } }),
      this.productRepository.count({ where: { isHot: 1 } }),
    ]);

    return {
      totalProducts: totalProducts || 0,
      totalStock: totalStock || 0,
      totalSales: totalSales || 0,
      avgPrice: avgPrice || 0,
      activeProducts: activeProducts || 0,
      newProducts: newProducts || 0,
      hotProducts: hotProducts || 0,
    };
  }

  /**
   * 获取热门商品
   */
  async getHotProducts(limit: number = 10) {
    return this.productRepository
      .find({
        where: { isShow: 1 },
        order: { sales: 'DESC' },
        take: limit,
        select: ['id', 'name', 'price', 'sales', 'mainImage', 'isHot'],
      });
  }

  /**
   * 获取滞销商品
   */
  async getUnsoldProducts(limit: number = 10) {
    return this.productRepository
      .find({
        where: { sales: 0, stock: MoreThanOrEqual(1) },
        order: { createdAt: 'ASC' },
        take: limit,
        select: ['id', 'name', 'price', 'stock', 'mainImage', 'createdAt'],
      });
  }

  /**
   * 获取系统概览数据
   */
  async getSystemOverview() {
    return await this.getProductStatistics();
  }

  /**
   * 获取销售趋势统计
   */
  async getSalesTrend(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 这里使用了简单的查询方式，实际项目中可能需要订单表的销售数据
    // 为了演示，我们按商品创建日期统计
    const products = await this.productRepository.find({
      where: { createdAt: MoreThanOrEqual(startDate) },
      select: ['sales', 'createdAt'],
    });

    // 按日期分组统计销售额
    const dailySales = new Map<string, number>();
    for (let i = 0; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - days + i);
      const dateKey = date.toISOString().split('T')[0];
      dailySales.set(dateKey, 0);
    }

    products.forEach(product => {
      const dateKey = product.createdAt.toISOString().split('T')[0];
      if (dailySales.has(dateKey)) {
        dailySales.set(dateKey, (dailySales.get(dateKey) || 0) + product.sales);
      }
    });

    return Array.from(dailySales.entries()).map(([date, sales]) => ({
      date,
      sales,
    }));
  }

  /**
   * 获取分类销售统计
   */
  async getCategoryStatistics() {
    const query = `
      SELECT category_id, COUNT(*) as totalProducts, SUM(sales) as totalSales
      FROM mall_product
      GROUP BY category_id
      ORDER BY totalSales DESC
    `;

    const result = await getConnection().query(query);
    return result;
  }

  /**
   * 获取价格区间统计
   */
  async getPriceRangeStatistics() {
    const query = `
      SELECT 
        CASE 
          WHEN price < 100 THEN '0-100'
          WHEN price < 500 THEN '100-500'
          WHEN price < 1000 THEN '500-1000'
          ELSE '1000+'
        END as priceRange,
        COUNT(*) as totalProducts,
        SUM(sales) as totalSales
      FROM mall_product
      GROUP BY priceRange
      ORDER BY priceRange
    `;

    const result = await getConnection().query(query);
    return result;
  }
}
