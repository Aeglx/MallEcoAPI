import { Controller, Get, Query } from '@nestjs/common';
import { FinancialStatisticsService } from '../services/financial-statistics.service';
import { FinancialStatisticsQueryDto } from '../dto/financial-statistics-query.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('财务统计')
@Controller('statistics/financial')
export class FinancialStatisticsController {
  constructor(private readonly financialStatisticsService: FinancialStatisticsService) {}

  @Get()
  @ApiOperation({ summary: '获取财务统计数据' })
  @ApiResponse({ status: 200, description: '获取财务统计数据成功' })
  getFinancialStatistics(@Query() queryDto: FinancialStatisticsQueryDto) {
    return this.financialStatisticsService.getFinancialStatistics(queryDto);
  }

  @Get('trend')
  @ApiOperation({ summary: '获取财务趋势数据' })
  @ApiResponse({ status: 200, description: '获取财务趋势数据成功' })
  getFinancialTrend(@Query() queryDto: FinancialStatisticsQueryDto) {
    return this.financialStatisticsService.getFinancialTrend(queryDto);
  }

  @Get('transaction')
  @ApiOperation({ summary: '获取交易类型分析' })
  @ApiResponse({ status: 200, description: '获取交易类型分析成功' })
  getTransactionTypeAnalysis(@Query() queryDto: FinancialStatisticsQueryDto) {
    return this.financialStatisticsService.getTransactionTypeAnalysis(queryDto);
  }

  @Get('summary')
  @ApiOperation({ summary: '获取财务汇总数据' })
  @ApiResponse({ status: 200, description: '获取财务汇总数据成功' })
  getFinancialSummary(@Query() queryDto: FinancialStatisticsQueryDto) {
    return this.financialStatisticsService.getFinancialSummary(queryDto);
  }

  @Get('report')
  @ApiOperation({ summary: '生成财务统计报告' })
  @ApiResponse({ status: 200, description: '生成财务统计报告成功' })
  generateFinancialReport(@Query() queryDto: FinancialStatisticsQueryDto) {
    return this.financialStatisticsService.generateFinancialReport(queryDto);
  }
}