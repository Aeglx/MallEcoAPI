import { Injectable, Inject } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SalesStatisticsService } from './sales-statistics.service';
import { UserStatisticsService } from './user-statistics.service';
import { OrderStatisticsService } from './order-statistics.service';
import { FinancialStatisticsService } from './financial-statistics.service';
import { DashboardQueryDto } from '../dto/dashboard-query.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly salesStatisticsService: SalesStatisticsService,
    private readonly userStatisticsService: UserStatisticsService,
    private readonly orderStatisticsService: OrderStatisticsService,
    private readonly financialStatisticsService: FinancialStatisticsService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async getDashboardData(queryDto: DashboardQueryDto) {
    const { startDate, endDate, granularity = 'daily' } = queryDto;

    // 并行获取各模块数据
    const [salesData, userData, orderData, financialData] = await Promise.all([
      this.salesStatisticsService.generateSalesReport({ startDate, endDate, granularity }),
      this.userStatisticsService.generateUserReport({ startDate, endDate, granularity }),
      this.orderStatisticsService.generateOrderReport({ startDate, endDate, granularity }),
      this.financialStatisticsService.generateFinancialReport({ startDate, endDate, granularity }),
    ]);

    // 获取实时数据（最后30天的数据）
    const realTimeData = await this.getRealTimeData();

    return {
      overview: {
        totalSales: salesData.summary.totalSales,
        totalOrders: orderData.summary.totalOrders,
        totalUsers: userData.summary.totalActiveUsers,
        netProfit: financialData.summary?.totalProfit || 0,
      },
      sales: salesData,
      users: userData,
      orders: orderData,
      financial: financialData,
      realTime: realTimeData,
    };
  }

  async getRealTimeData() {
    // 获取最近30天的实时数据
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      // 使用Elasticsearch获取实时数据
      const realTimeQuery = {
        index: 'mall-eco-real-time',
        body: {
          query: {
            range: {
              timestamp: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
          aggs: {
            hourly_activity: {
              date_histogram: {
                field: 'timestamp',
                calendar_interval: 'hour',
              },
              aggs: {
                active_users: {
                  cardinality: {
                    field: 'userId',
                  },
                },
                orders_count: {
                  sum: {
                    field: 'orders',
                  },
                },
              },
            },
          },
        },
      };

      const result = await this.elasticsearchService.search(realTimeQuery);
      
      return {
        hourlyActivity: result.aggregations?.hourly_activity?.buckets || [],
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      // 如果Elasticsearch不可用，返回空数据
      return {
        hourlyActivity: [],
        lastUpdated: new Date().toISOString(),
        error: 'Real-time data temporarily unavailable',
      };
    }
  }

  async getQuickStats() {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [todayData, yesterdayData] = await Promise.all([
      this.getDashboardData({ startDate: today, endDate: today }),
      this.getDashboardData({ startDate: yesterday, endDate: yesterday }),
    ]);

    const calculateGrowth = (todayValue: number, yesterdayValue: number) => {
      if (yesterdayValue === 0) return 100;
      return ((todayValue - yesterdayValue) / yesterdayValue) * 100;
    };

    return {
      sales: {
        today: todayData.overview.totalSales,
        growth: calculateGrowth(todayData.overview.totalSales, yesterdayData.overview.totalSales),
      },
      orders: {
        today: todayData.overview.totalOrders,
        growth: calculateGrowth(todayData.overview.totalOrders, yesterdayData.overview.totalOrders),
      },
      users: {
        today: todayData.overview.totalUsers,
        growth: calculateGrowth(todayData.overview.totalUsers, yesterdayData.overview.totalUsers),
      },
      profit: {
        today: todayData.overview.netProfit,
        growth: calculateGrowth(todayData.overview.netProfit, yesterdayData.overview.netProfit),
      },
    };
  }

  async exportDashboardReport(queryDto: DashboardQueryDto, format: 'pdf' | 'excel' | 'csv' = 'pdf') {
    const dashboardData = await this.getDashboardData(queryDto);

    // 这里可以根据格式生成不同的导出文件
    // 实际项目中会使用相应的库来生成PDF、Excel或CSV文件
    
    return {
      data: dashboardData,
      format,
      generatedAt: new Date().toISOString(),
      fileName: `dashboard-report-${new Date().toISOString().split('T')[0]}.${format}`,
    };
  }
}