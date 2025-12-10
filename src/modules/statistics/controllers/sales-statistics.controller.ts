import { Controller, Get, Query } from '@nestjs/common';
import { SalesStatisticsService } from '../services/sales-statistics.service';
import { SalesStatisticsQueryDto } from '../dto/sales-statistics-query.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Statistics - 销售统计')
@Controller('statistics/sales')
export class SalesStatisticsController {
  constructor(private readonly salesStatisticsService: SalesStatisticsService) {}

  @Get()
  @ApiOperation({ summary: '获取销售统计数据' })
  @ApiResponse({ status: 200, description: '获取销售统计数据成功' })
  getSalesStatistics(@Query() queryDto: SalesStatisticsQueryDto) {
    return this.salesStatisticsService.getSalesStatistics(queryDto);
  }

  @Get('top-products')
  @ApiOperation({ summary: '获取热销商品排行' })
  @ApiResponse({ status: 200, description: '获取热销商品排行成功' })
  getTopProducts(@Query() queryDto: SalesStatisticsQueryDto) {
    return this.salesStatisticsService.getTopProducts(queryDto);
  }

  @Get('trend')
  @ApiOperation({ summary: '获取销售趋势数据' })
  @ApiResponse({ status: 200, description: '获取销售趋势数据成功' })
  getSalesTrend(@Query() queryDto: SalesStatisticsQueryDto) {
    return this.salesStatisticsService.getSalesTrend(queryDto);
  }

  @Get('category')
  @ApiOperation({ summary: '获取分类销售数据' })
  @ApiResponse({ status: 200, description: '获取分类销售数据成功' })
  getCategorySales(@Query() queryDto: SalesStatisticsQueryDto) {
    return this.salesStatisticsService.getCategorySales(queryDto);
  }

  @Get('report')
  @ApiOperation({ summary: '生成销售统计报告' })
  @ApiResponse({ status: 200, description: '生成销售统计报告成功' })
  generateSalesReport(@Query() queryDto: SalesStatisticsQueryDto) {
    return this.salesStatisticsService.generateSalesReport(queryDto);
  }
}