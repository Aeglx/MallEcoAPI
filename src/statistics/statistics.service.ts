import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, createQueryBuilder, Between } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Order } from '../../modules/client/common/order/entities/order.entity';
import { OrderItem } from '../../modules/client/common/order/entities/order-item.entity';
import { User } from '../../modules/client/comm../infrastructure/auth/entities/user.entity';
import { Article } from '../../modules/client/common/content/entities/article.entity';
import { ArticleCategory } from '../../modules/client/common/content/entities/article-category.entity';
import { ArticleComment } from '../../modules/client/common/content/entities/article-comment.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Article) private articleRepository: Repository<Article>,
    @InjectRepository(ArticleCategory) private categoryRepository: Repository<ArticleCategory>,
    @InjectRepository(ArticleComment) private commentRepository: Repository<ArticleComment>,
  ) {}

  /**
   * 获取商品销售统�?
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
    const [productStats, orderStats, userStats] = await Promise.all([
      this.getProductStatistics(),
      this.getOrderStatistics(),
      this.getUserStatistics()
    ]);

    return {
      ...productStats,
      ...orderStats,
      ...userStats
    };
  }

  /**
   * 获取订单统计
   */
  private async getOrderStatistics() {
    const [totalOrders, completedOrders, totalRevenue, avgOrderValue] = await Promise.all([
      this.orderRepository.count(),
      this.orderRepository.count({ where: { orderStatus: 2 } }), // 已完成订�?
      this.orderItemRepository.sum('totalPrice', {}),
      this.orderRepository.average('payAmount', { where: { orderStatus: 2 } } as any)
    ]);

    return {
      totalOrders: totalOrders || 0,
      completedOrders: completedOrders || 0,
      totalRevenue: totalRevenue || 0,
      avgOrderValue: avgOrderValue || 0
    };
  }

  /**
   * 获取用户统计
   */
  private async getUserStatistics() {
    const [totalUsers, activeUsers] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { isActive: 1 } })
    ]);

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0
    };
  }

  /**
   * 获取销售趋势统�?
   */
  async getSalesTrend(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 使用订单数据统计销售趋�?
    const query = this.orderItemRepository.createQueryBuilder('orderItem');
    query.leftJoin('orderItem.order', 'order');
    query.select('DATE(order.create_time) as date, SUM(orderItem.total_price) as salesAmount');
    query.where('order.create_time >= :startDate', { startDate });
    query.andWhere('order.order_status = :orderStatus', { orderStatus: 2 }); // 已完成的订单
    query.groupBy('DATE(order.create_time)');
    query.orderBy('date', 'ASC');
    
    const result = await query.getRawMany();

    // 初始化所有日期的销售额�?
    const dailySales = new Map<string, number>();
    for (let i = 0; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - days + i);
      const dateKey = date.toISOString().split('T')[0];
      dailySales.set(dateKey, 0);
    }

    // 填充查询结果
    result.forEach(item => {
      dailySales.set(item.date, Number(item.salesAmount) || 0);
    });

    return Array.from(dailySales.entries()).map(([date, salesAmount]) => ({
      date,
      salesAmount
    }));
  }

  /**
   * 获取分类销售统�?
   */
  async getCategoryStatistics() {
    const query = this.productRepository.createQueryBuilder('product');
    query.select('product.categoryId as categoryId, COUNT(*) as totalProducts, SUM(product.sales) as totalSales');
    query.groupBy('product.categoryId');
    query.orderBy('totalSales', 'DESC');
    
    return await query.getRawMany();
  }

  /**
   * 获取价格区间统计
   */
  async getPriceRangeStatistics() {
    // 使用TypeORM查询构建器实现价格区间统�?
    const products = await this.productRepository.find({
      select: ['price', 'sales'],
    });

    // 价格区间映射
    const priceRanges = [
      { name: '0-100', min: 0, max: 100 },
      { name: '100-500', min: 100, max: 500 },
      { name: '500-1000', min: 500, max: 1000 },
      { name: '1000+', min: 1000, max: Infinity }
    ];

    // 初始化统计结�?
    const statistics = priceRanges.map(range => ({
      priceRange: range.name,
      totalProducts: 0,
      totalSales: 0
    }));

    // 统计每个区间的商品数量和销售额
    products.forEach(product => {
      const range = priceRanges.find(r => product.price >= r.min && product.price < r.max);
      if (range) {
        const index = priceRanges.indexOf(range);
        statistics[index].totalProducts++;
        statistics[index].totalSales += product.sales;
      }
    });

    return statistics;
  }

  /**
   * 获取内容管理统计
   */
  async getContentStatistics() {
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      totalViews,
      totalLikes,
      totalComments,
      totalCategories,
      activeCategories,
    ] = await Promise.all([
      this.articleRepository.count(),
      this.articleRepository.count({ where: { status: 'published' } }),
      this.articleRepository.count({ where: { status: 'draft' } }),
      this.articleRepository.sum('viewCount', {}),
      this.articleRepository.sum('likeCount', {}),
      this.commentRepository.count({ where: { status: 'approved' } }),
      this.categoryRepository.count(),
      this.categoryRepository.count({ where: { isActive: true } }),
    ]);

    return {
      totalArticles: totalArticles || 0,
      publishedArticles: publishedArticles || 0,
      draftArticles: draftArticles || 0,
      totalViews: totalViews || 0,
      totalLikes: totalLikes || 0,
      totalComments: totalComments || 0,
      totalCategories: totalCategories || 0,
      activeCategories: activeCategories || 0,
    };
  }

  /**
   * 获取文章阅读趋势
   */
  async getArticleTrend(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.articleRepository.createQueryBuilder('article')
      .select('DATE(article.createdAt) as date, COUNT(*) as articleCount, SUM(article.viewCount) as totalViews')
      .where('article.createdAt >= :startDate', { startDate })
      .groupBy('DATE(article.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    // 初始化所有日期的数据
    const dailyStats = new Map<string, { articleCount: number; totalViews: number }>();
    for (let i = 0; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - days + i);
      const dateKey = date.toISOString().split('T')[0];
      dailyStats.set(dateKey, { articleCount: 0, totalViews: 0 });
    }

    // 填充查询结果
    result.forEach(item => {
      dailyStats.set(item.date, {
        articleCount: Number(item.articleCount) || 0,
        totalViews: Number(item.totalViews) || 0,
      });
    }

    return Array.from(dailyStats.entries()).map(([date, stats]) => ({
      date,
      ...stats,
    }));
  }

  /**
   * 获取热门文章排行
   */
  async getHotArticles(limit: number = 10) {
    return this.articleRepository.find({
      where: { status: 'published' },
      order: { viewCount: 'DESC' },
      take: limit,
      select: ['id', 'title', 'viewCount', 'likeCount', 'publishedAt'],
      relations: ['category'],
    });
  }

  /**
   * 获取分类文章统计
   */
  async getCategoryArticleStatistics() {
    const result = await this.categoryRepository.createQueryBuilder('category')
      .leftJoin('category.articles', 'article')
      .select([
        'category.id',
        'category.name',
        'COUNT(article.id) as totalArticles',
        'SUM(article.viewCount) as totalViews',
        'SUM(article.likeCount) as totalLikes',
      ])
      .where('category.isActive = :isActive', { isActive: true })
      .groupBy('category.id')
      .orderBy('totalViews', 'DESC')
      .getRawMany();

    return result.map(item => ({
      categoryId: item.id,
      categoryName: item.name,
      totalArticles: Number(item.totalArticles) || 0,
      totalViews: Number(item.totalViews) || 0,
      totalLikes: Number(item.totalLikes) || 0,
    }));
  }

  /**
   * 获取用户活跃度统�?
   */
  async getUserActivityStatistics(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      newUserCount,
      activeUsersCount,
      articleCommentsCount,
      orderUsersCount,
    ] = await Promise.all([
      this.userRepository.count({
        where: { createdAt: MoreThanOrEqual(startDate) }
      }),
      this.userRepository.count({
        where: { 
          isActive: 1,
          updatedAt: MoreThanOrEqual(startDate)
        }
      }),
      this.commentRepository.count({
        where: { 
          status: 'approved',
          createdAt: MoreThanOrEqual(startDate)
        }
      }),
      this.orderRepository.count({
        where: { 
          createTime: MoreThanOrEqual(startDate),
          orderStatus: 2 // 已完成订�?
        }
      }),
    ]);

    return {
      newUserCount,
      activeUsersCount,
      articleCommentsCount,
      orderUsersCount,
      period: `${days}天`,
    };
  }

  /**
   * 获取综合仪表盘数�?
   */
  async getDashboardStatistics() {
    const [
      productStats,
      orderStats,
      userStats,
      contentStats,
      userActivityStats,
      hotProducts,
      hotArticles,
    ] = await Promise.all([
      this.getProductStatistics(),
      this.getOrderStatistics(),
      this.getUserStatistics(),
      this.getContentStatistics(),
      this.getUserActivityStatistics(7),
      this.getHotProducts(5),
      this.getHotArticles(5),
    ]);

    return {
      overview: {
        ...productStats,
        ...orderStats,
        ...userStats,
        ...contentStats,
      },
      userActivity: userActivityStats,
      hotProducts,
      hotArticles,
    };
  }

  /**
   * 获取时间段统计对�?
   */
  async getPeriodComparison(currentDays: number = 7, previousDays: number = 7) {
    const now = new Date();
    const currentStart = new Date(now.getTime() - currentDays * 24 * 60 * 60 * 1000);
    const previousStart = new Date(currentStart.getTime() - previousDays * 24 * 60 * 60 * 1000);
    const previousEnd = currentStart;

    const [
      currentOrders,
      previousOrders,
      currentRevenue,
      previousRevenue,
      currentUsers,
      previousUsers,
      currentArticles,
      previousArticles,
    ] = await Promise.all([
      this.orderRepository.count({
        where: { createTime: Between(currentStart, now) }
      }),
      this.orderRepository.count({
        where: { createTime: Between(previousStart, previousEnd) }
      }),
      this.orderItemRepository.sum('totalPrice', {
        where: { 
          order: { createTime: Between(currentStart, now) },
        }
      } as any),
      this.orderItemRepository.sum('totalPrice', {
        where: { 
          order: { createTime: Between(previousStart, previousEnd) },
        }
      } as any),
      this.userRepository.count({
        where: { createdAt: Between(currentStart, now) }
      }),
      this.userRepository.count({
        where: { createdAt: Between(previousStart, previousEnd) }
      }),
      this.articleRepository.count({
        where: { createdAt: Between(currentStart, now) }
      }),
      this.articleRepository.count({
        where: { createdAt: Between(previousStart, previousEnd) }
      }),
    ]);

    return {
      orders: {
        current: currentOrders || 0,
        previous: previousOrders || 0,
        growth: previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders * 100).toFixed(2) : '0.00',
      },
      revenue: {
        current: currentRevenue || 0,
        previous: previousRevenue || 0,
        growth: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(2) : '0.00',
      },
      users: {
        current: currentUsers || 0,
        previous: previousUsers || 0,
        growth: previousUsers > 0 ? ((currentUsers - previousUsers) / previousUsers * 100).toFixed(2) : '0.00',
      },
      articles: {
        current: currentArticles || 0,
        previous: previousArticles || 0,
        growth: previousArticles > 0 ? ((currentArticles - previousArticles) / previousArticles * 100).toFixed(2) : '0.00',
      },
    };
  }
}


