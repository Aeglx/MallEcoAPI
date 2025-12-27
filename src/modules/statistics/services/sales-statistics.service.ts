import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { SalesStatistics } from '../entities/sales-statistics.entity';
import { SalesStatisticsQueryDto } from '../dto/sales-statistics-query.dto';

@Injectable()
export class SalesStatisticsService {
  constructor(
    @InjectRepository(SalesStatistics)
    private salesStatisticsRepository: Repository<SalesStatistics>,
  ) {}

  async getSalesStatistics(queryDto: SalesStatisticsQueryDto) {
    const { startDate, endDate, productId, categoryId, granularity = 'daily' } = queryDto;

    const queryBuilder = this.salesStatisticsRepository
      .createQueryBuilder('sales')
      .where('sales.granularity = :granularity', { granularity });

    if (startDate && endDate) {
      queryBuilder.andWhere('sales.statDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('sales.statDate >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('sales.statDate <= :endDate', { endDate });
    }

    if (productId) {
      queryBuilder.andWhere('sales.productId = :productId', { productId });
    }

    if (categoryId) {
      queryBuilder.andWhere('sales.categoryId = :categoryId', { categoryId });
    }

    return await queryBuilder.orderBy('sales.statDate', 'ASC').getMany();
  }

  async getTopProducts(queryDto: SalesStatisticsQueryDto) {
    const { startDate, endDate, limit = 10 } = queryDto;

    const queryBuilder = this.salesStatisticsRepository
      .createQueryBuilder('sales')
      .select([
        'sales.productId',
        'sales.productName',
        'SUM(sales.salesQuantity) as totalQuantity',
        'SUM(sales.salesAmount) as totalAmount',
        'AVG(sales.conversionRate) as avgConversionRate',
      ])
      .where('sales.productId IS NOT NULL');

    if (startDate && endDate) {
      queryBuilder.andWhere('sales.statDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return await queryBuilder
      .groupBy('sales.productId')
      .addGroupBy('sales.productName')
      .orderBy('totalAmount', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getSalesTrend(queryDto: SalesStatisticsQueryDto) {
    const { startDate, endDate, granularity = 'daily' } = queryDto;

    const queryBuilder = this.salesStatisticsRepository
      .createQueryBuilder('sales')
      .select([
        'sales.statDate',
        'SUM(sales.salesQuantity) as totalQuantity',
        'SUM(sales.salesAmount) as totalAmount',
        'AVG(sales.conversionRate) as avgConversionRate',
      ])
      .where('sales.granularity = :granularity', { granularity });

    if (startDate && endDate) {
      queryBuilder.andWhere('sales.statDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return await queryBuilder
      .groupBy('sales.statDate')
      .orderBy('sales.statDate', 'ASC')
      .getRawMany();
  }

  async getCategorySales(queryDto: SalesStatisticsQueryDto) {
    const { startDate, endDate } = queryDto;

    const queryBuilder = this.salesStatisticsRepository
      .createQueryBuilder('sales')
      .select([
        'sales.categoryId',
        'sales.categoryName',
        'SUM(sales.salesQuantity) as totalQuantity',
        'SUM(sales.salesAmount) as totalAmount',
      ])
      .where('sales.categoryId IS NOT NULL');

    if (startDate && endDate) {
      queryBuilder.andWhere('sales.statDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return await queryBuilder
      .groupBy('sales.categoryId')
      .addGroupBy('sales.categoryName')
      .orderBy('totalAmount', 'DESC')
      .getRawMany();
  }

  async generateSalesReport(queryDto: SalesStatisticsQueryDto) {
    const statistics = await this.getSalesStatistics(queryDto);
    const topProducts = await this.getTopProducts(queryDto);
    const salesTrend = await this.getSalesTrend(queryDto);
    const categorySales = await this.getCategorySales(queryDto);

    return {
      summary: {
        totalSales: statistics.reduce((sum, item) => sum + item.salesAmount, 0),
        totalQuantity: statistics.reduce((sum, item) => sum + item.salesQuantity, 0),
        avgConversionRate:
          statistics.length > 0
            ? statistics.reduce((sum, item) => sum + item.conversionRate, 0) / statistics.length
            : 0,
      },
      topProducts,
      salesTrend,
      categorySales,
      detailedStatistics: statistics,
    };
  }
}
