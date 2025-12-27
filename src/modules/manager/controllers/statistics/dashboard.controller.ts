import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('管理端-数据统计')
@Controller('manager/statistics/dashboard')
export class DashboardController {
  @Get('overview')
  @ApiOperation({ summary: '获取数据总览' })
  getOverview(@Query('dateRange') dateRange: string) {
    return {
      totalUsers: 1500,
      totalOrders: 2500,
      totalRevenue: 125000,
      growthRate: 15.5,
    };
  }

  @Get('sales')
  @ApiOperation({ summary: '获取销售统计' })
  getSalesStatistics(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return {
      dailySales: [
        { date: '2024-01-01', amount: 5000 },
        { date: '2024-01-02', amount: 6200 },
        { date: '2024-01-03', amount: 5800 },
      ],
      totalSales: 17000,
    };
  }

  @Get('user')
  @ApiOperation({ summary: '获取用户统计' })
  getUserStatistics() {
    return {
      newUsers: 50,
      activeUsers: 1200,
      userGrowth: 12.3,
    };
  }

  @Get('goods')
  @ApiOperation({ summary: '获取商品统计' })
  getGoodsStatistics() {
    return {
      totalGoods: 1500,
      onSaleGoods: 1200,
      soldOutGoods: 300,
      avgPrice: 89.5,
    };
  }
}
