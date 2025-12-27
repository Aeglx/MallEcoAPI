import { Controller, Get, Query, Post, Body, Param } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';
import { DashboardQueryDto } from '../dto/dashboard-query.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('仪表盘')
@Controller('statistics/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: '获取仪表盘数据' })
  @ApiResponse({ status: 200, description: '获取仪表盘数据成功' })
  getDashboardData(@Query() queryDto: DashboardQueryDto) {
    return this.dashboardService.getDashboardData(queryDto);
  }

  @Get('quick-stats')
  @ApiOperation({ summary: '获取快速统计数据' })
  @ApiResponse({ status: 200, description: '获取快速统计数据成功' })
  getQuickStats() {
    return this.dashboardService.getQuickStats();
  }

  @Get('real-time')
  @ApiOperation({ summary: '获取实时数据' })
  @ApiResponse({ status: 200, description: '获取实时数据成功' })
  getRealTimeData() {
    return this.dashboardService.getRealTimeData();
  }

  @Post('export/:format')
  @ApiOperation({ summary: '导出仪表盘报告' })
  @ApiResponse({ status: 200, description: '导出仪表盘报告成功' })
  exportDashboardReport(
    @Query() queryDto: DashboardQueryDto,
    @Param('format') format: 'pdf' | 'excel' | 'csv',
  ) {
    return this.dashboardService.exportDashboardReport(queryDto, format);
  }
}
