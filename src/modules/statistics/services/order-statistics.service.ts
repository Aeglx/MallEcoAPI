import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatistics } from '../entities/order-statistics.entity';
import { OrderStatisticsQueryDto } from '../dto/order-statistics-query.dto';

@Injectable()
export class OrderStatisticsService {
  constructor(
    @InjectRepository(OrderStatistics)
    private orderStatisticsRepository: Repository<OrderStatistics>,
  ) {}

  async getOrderStatistics(queryDto: OrderStatisticsQueryDto) {
    const { startDate, endDate, orderStatus, paymentMethod, granularity = 'daily' } = queryDto;
    
    const queryBuilder = this.orderStatisticsRepository
      .createQueryBuilder('order')
      .where('order.granularity = :granularity', { granularity });

    if (startDate && endDate) {
      queryBuilder.andWhere('order.statDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    if (orderStatus) {
      queryBuilder.andWhere('order.orderStatus = :orderStatus', { orderStatus });
    }

    if (paymentMethod) {
      queryBuilder.andWhere('order.paymentMethod = :paymentMethod', { paymentMethod });
    }

    return await queryBuilder
      .orderBy('order.statDate', 'ASC')
      .getMany();
  }

  async getOrderTrend(queryDto: OrderStatisticsQueryDto) {
    const { startDate, endDate, granularity = 'daily' } = queryDto;
    
    const queryBuilder = this.orderStatisticsRepository
      .createQueryBuilder('order')
      .select([
        'order.statDate',
        'SUM(order.orderCount) as totalOrders',
        'SUM(order.orderAmount) as totalAmount',
        'AVG(order.avgOrderAmount) as avgOrderAmount',
        'AVG(order.successRate) as avgSuccessRate'
      ])
      .where('order.granularity = :granularity', { granularity });

    if (startDate && endDate) {
      queryBuilder.andWhere('order.statDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    return await queryBuilder
      .groupBy('order.statDate')
      .orderBy('order.statDate', 'ASC')
      .getRawMany();
  }

  async getOrderStatusAnalysis(queryDto: OrderStatisticsQueryDto) {
    const { startDate, endDate } = queryDto;
    
    const queryBuilder = this.orderStatisticsRepository
      .createQueryBuilder('order')
      .select([
        'order.orderStatus',
        'SUM(order.orderCount) as orderCount',
        'SUM(order.orderAmount) as orderAmount',
        'SUM(order.successfulOrders) as successfulOrders',
        'SUM(order.failedOrders) as failedOrders',
        'SUM(order.refundOrders) as refundOrders',
        'SUM(order.canceledOrders) as canceledOrders'
      ]);

    if (startDate && endDate) {
      queryBuilder.andWhere('order.statDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    return await queryBuilder
      .groupBy('order.orderStatus')
      .getRawMany();
  }

  async getPaymentMethodAnalysis(queryDto: OrderStatisticsQueryDto) {
    const { startDate, endDate } = queryDto;
    
    const queryBuilder = this.orderStatisticsRepository
      .createQueryBuilder('order')
      .select([
        'order.paymentMethod',
        'SUM(order.orderCount) as orderCount',
        'SUM(order.orderAmount) as orderAmount',
        'AVG(order.successRate) as avgSuccessRate'
      ])
      .where('order.paymentMethod IS NOT NULL');

    if (startDate && endDate) {
      queryBuilder.andWhere('order.statDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    return await queryBuilder
      .groupBy('order.paymentMethod')
      .orderBy('orderCount', 'DESC')
      .getRawMany();
  }

  async generateOrderReport(queryDto: OrderStatisticsQueryDto) {
    const statistics = await this.getOrderStatistics(queryDto);
    const orderTrend = await this.getOrderTrend(queryDto);
    const statusAnalysis = await this.getOrderStatusAnalysis(queryDto);
    const paymentAnalysis = await this.getPaymentMethodAnalysis(queryDto);

    return {
      summary: {
        totalOrders: statistics.reduce((sum, item) => sum + item.orderCount, 0),
        totalAmount: statistics.reduce((sum, item) => sum + item.orderAmount, 0),
        avgOrderAmount: statistics.reduce((sum, item) => sum + item.avgOrderAmount, 0) / statistics.length,
        successRate: statistics.reduce((sum, item) => sum + item.successRate, 0) / statistics.length,
      },
      orderTrend,
      statusAnalysis,
      paymentAnalysis,
      detailedStatistics: statistics,
    };
  }
}