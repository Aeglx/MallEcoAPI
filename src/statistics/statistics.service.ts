import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { User } from '../modules/users/entities/user.entity';
import { UserStatus } from '../modules/users/entities/user.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(User) private userRepository: Repository<User>,
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
    return this.productRepository.find({
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
    return this.productRepository.find({
      where: { sales: 0, stock: 1 },
      order: { createdAt: 'ASC' },
      take: limit,
      select: ['id', 'name', 'price', 'stock', 'mainImage', 'createdAt'],
    });
  }

  /**
   * 获取系统概览数据
   */
  async getSystemOverview() {
    const [productStats, userStats] = await Promise.all([
      this.getProductStatistics(),
      this.getUserStatistics(),
    ]);

    return {
      ...productStats,
      ...userStats,
    };
  }

  /**
   * 获取订单统计
   */
  private async getOrderStatistics() {
    // 由于订单相关实体不存在，返回默认值
    return {
      totalOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
    };
  }

  /**
   * 获取用户统计
   */
  private async getUserStatistics() {
    const [totalUsers, activeUsers] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { status: UserStatus.ACTIVE } }),
    ]);

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
    };
  }

  /**
   * 获取销售趋势统计
   */
  async getSalesTrend(days: number = 30) {
    // 由于订单数据不存在，返回模拟数据
    const result = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - days + i);
      result.push({
        date: date.toISOString().split('T')[0],
        salesAmount: Math.floor(Math.random() * 1000),
      });
    }
    return result;
  }

  /**
   * 获取分类销售统计
   */
  async getCategoryStatistics() {
    // 返回模拟数据
    return [
      { categoryId: 1, totalProducts: 10, totalSales: 100 },
      { categoryId: 2, totalProducts: 15, totalSales: 150 },
    ];
  }

  /**
   * 获取价格区间统计
   */
  async getPriceRangeStatistics() {
    return [
      { priceRange: '0-100', totalProducts: 5, totalSales: 50 },
      { priceRange: '100-500', totalProducts: 8, totalSales: 80 },
      { priceRange: '500-1000', totalProducts: 3, totalSales: 30 },
      { priceRange: '1000+', totalProducts: 2, totalSales: 20 },
    ];
  }

  /**
   * 获取内容管理统计
   */
  async getContentStatistics() {
    // 返回模拟数据
    return {
      totalArticles: 0,
      publishedArticles: 0,
      draftArticles: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalCategories: 0,
      activeCategories: 0,
    };
  }

  /**
   * 获取综合仪表盘数据
   */
  async getDashboardStatistics() {
    const [productStats, orderStats, userStats, contentStats, hotProducts] = await Promise.all([
      this.getProductStatistics(),
      this.getOrderStatistics(),
      this.getUserStatistics(),
      this.getContentStatistics(),
      this.getHotProducts(5),
    ]);

    return {
      overview: {
        ...productStats,
        ...orderStats,
        ...userStats,
        ...contentStats,
      },
      hotProducts,
    };
  }
}
