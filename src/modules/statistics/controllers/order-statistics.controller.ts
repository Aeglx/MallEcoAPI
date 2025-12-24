import { Controller, Get, Query } from '@nestjs/common';
import { OrderStatisticsService } from '../services/order-statistics.service';
import { OrderStatisticsQueryDto } from '../dto/order-statistics-query.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('订单统计')
@Controller('statistics/orders')
export class OrderStatisticsController {
  constructor(private readonly orderStatisticsService: OrderStatisticsService) {}

  @Get()
  @ApiOperation({ summary: '获取订单统计数据' })
  @ApiResponse({ status: 200, description: '获取订单统计数据成功' })
  getOrderStatistics(@Query() queryDto: OrderStatisticsQueryDto) {
    return this.orderStatisticsService.getOrderStatistics(queryDto);
  }

  @Get('trend')
  @ApiOperation({ summary: '获取订单趋势数据' })
  @ApiResponse({ status: 200, description: '获取订单趋势数据成功' })
  getOrderTrend(@Query() queryDto: OrderStatisticsQueryDto) {
    return this.orderStatisticsService.getOrderTrend(queryDto);
  }

  @Get('status')
  @ApiOperation({ summary: '获取订单状态分析' })
  @ApiResponse({ status: 200, description: '获取订单状态分析成功' })
  getOrderStatusAnalysis(@Query() queryDto: OrderStatisticsQueryDto) {
    return this.orderStatisticsService.getOrderStatusAnalysis(queryDto);
  }

  @Get('payment')
  @ApiOperation({ summary: '获取支付方式分析' })
  @ApiResponse({ status: 200, description: '获取支付方式分析成功' })
  getPaymentMethodAnalysis(@Query() queryDto: OrderStatisticsQueryDto) {
    return this.orderStatisticsService.getPaymentMethodAnalysis(queryDto);
  }

  @Get('report')
  @ApiOperation({ summary: '生成订单统计报告' })
  @ApiResponse({ status: 200, description: '生成订单统计报告成功' })
  generateOrderReport(@Query() queryDto: OrderStatisticsQueryDto) {
    return this.orderStatisticsService.generateOrderReport(queryDto);
  }
}