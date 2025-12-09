import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, createQueryBuilder } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Order } from '../../modules/common/order/entities/order.entity';
import { OrderItem } from '../../modules/common/order/entities/order-item.entity';
import { User } from '../../modules/common/auth/entities/user.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepository: Repository<OrderItem>,
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
      this.orderRepository.count({ where: { orderStatus: 2 } }), // 已完成订单
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
   * 获取销售趋势统计
   */
  async getSalesTrend(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 使用订单数据统计销售趋势
    const query = this.orderItemRepository.createQueryBuilder('orderItem');
    query.leftJoin('orderItem.order', 'order');
    query.select('DATE(order.create_time) as date, SUM(orderItem.total_price) as salesAmount');
    query.where('order.create_time >= :startDate', { startDate });
    query.andWhere('order.order_status = :orderStatus', { orderStatus: 2 }); // 已完成的订单
    query.groupBy('DATE(order.create_time)');
    query.orderBy('date', 'ASC');
    
    const result = await query.getRawMany();

    // 初始化所有日期的销售额为0
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
   * 获取分类销售统计
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
    // 使用TypeORM查询构建器实现价格区间统计
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

    // 初始化统计结果
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
}
