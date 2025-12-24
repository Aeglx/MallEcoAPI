import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinancialStatistics } from '../entities/financial-statistics.entity';
import { FinancialStatisticsQueryDto } from '../dto/financial-statistics-query.dto';

@Injectable()
export class FinancialStatisticsService {
  constructor(
    @InjectRepository(FinancialStatistics)
    private financialStatisticsRepository: Repository<FinancialStatistics>,
  ) {}

  async getFinancialStatistics(queryDto: FinancialStatisticsQueryDto) {
    const { startDate, endDate, accountType, transactionType, granularity = 'daily' } = queryDto;
    
    const queryBuilder = this.financialStatisticsRepository
      .createQueryBuilder('finance')
      .where('finance.granularity = :granularity', { granularity });

    if (startDate && endDate) {
      queryBuilder.andWhere('finance.statDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    if (accountType) {
      queryBuilder.andWhere('finance.accountType = :accountType', { accountType });
    }

    if (transactionType) {
      queryBuilder.andWhere('finance.transactionType = :transactionType', { transactionType });
    }

    return await queryBuilder
      .orderBy('finance.statDate', 'ASC')
      .getMany();
  }

  async getFinancialTrend(queryDto: FinancialStatisticsQueryDto) {
    const { startDate, endDate, granularity = 'daily' } = queryDto;
    
    const queryBuilder = this.financialStatisticsRepository
      .createQueryBuilder('finance')
      .select([
        'finance.statDate',
        'SUM(finance.incomeAmount) as totalIncome',
        'SUM(finance.expenseAmount) as totalExpense',
        'SUM(finance.netProfit) as totalProfit',
        'SUM(finance.platformCommission) as totalCommission'
      ])
      .where('finance.granularity = :granularity', { granularity });

    if (startDate && endDate) {
      queryBuilder.andWhere('finance.statDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    return await queryBuilder
      .groupBy('finance.statDate')
      .orderBy('finance.statDate', 'ASC')
      .getRawMany();
  }

  async getTransactionTypeAnalysis(queryDto: FinancialStatisticsQueryDto) {
    const { startDate, endDate, accountType } = queryDto;
    
    const queryBuilder = this.financialStatisticsRepository
      .createQueryBuilder('finance')
      .select([
        'finance.transactionType',
        'SUM(finance.transactionCount) as transactionCount',
        'SUM(finance.transactionAmount) as transactionAmount'
      ])
      .where('finance.transactionType IS NOT NULL');

    if (startDate && endDate) {
      queryBuilder.andWhere('finance.statDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    if (accountType) {
      queryBuilder.andWhere('finance.accountType = :accountType', { accountType });
    }

    return await queryBuilder
      .groupBy('finance.transactionType')
      .orderBy('transactionAmount', 'DESC')
      .getRawMany();
  }

  async getFinancialSummary(queryDto: FinancialStatisticsQueryDto) {
    const { startDate, endDate } = queryDto;
    
    const queryBuilder = this.financialStatisticsRepository
      .createQueryBuilder('finance')
      .select([
        'SUM(finance.incomeAmount) as totalIncome',
        'SUM(finance.expenseAmount) as totalExpense',
        'SUM(finance.netProfit) as totalProfit',
        'SUM(finance.platformCommission) as totalCommission',
        'SUM(finance.taxAmount) as totalTax',
        'AVG(finance.totalAssets) as avgAssets',
        'AVG(finance.totalLiabilities) as avgLiabilities',
        'AVG(finance.netAssets) as avgNetAssets'
      ]);

    if (startDate && endDate) {
      queryBuilder.andWhere('finance.statDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    return await queryBuilder.getRawOne();
  }

  async generateFinancialReport(queryDto: FinancialStatisticsQueryDto) {
    const statistics = await this.getFinancialStatistics(queryDto);
    const financialTrend = await this.getFinancialTrend(queryDto);
    const transactionAnalysis = await this.getTransactionTypeAnalysis(queryDto);
    const summary = await this.getFinancialSummary(queryDto);

    return {
      summary,
      financialTrend,
      transactionAnalysis,
      detailedStatistics: statistics,
    };
  }
}