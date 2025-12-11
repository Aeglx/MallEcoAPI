import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PerformanceMonitorService } from '../services/performance-monitor.service';
import { SkipPerformance } from '../../../common/decorators/skip-performance.decorator';

@ApiTags('性能监控')
@Controller('system/performance')
@SkipPerformance()
export class PerformanceMonitorController {
  constructor(private readonly performanceMonitorService: PerformanceMonitorService) {}

  @Get('api/stats')
  @ApiOperation({ summary: '获取API性能统计' })
  @ApiQuery({ name: 'endpoint', description: 'API端点', required: false })
  @ApiQuery({ name: 'timeRange', description: '时间范围(1h,24h,7d,30d)', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getApiPerformanceStats(
    @Query('endpoint') endpoint?: string,
    @Query('timeRange') timeRange?: string,
  ) {
    return this.performanceMonitorService.getApiPerformanceStats(endpoint, timeRange);
  }

  @Get('database/stats')
  @ApiOperation({ summary: '获取数据库性能统计' })
  @ApiQuery({ name: 'timeRange', description: '时间范围(1h,24h,7d,30d)', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDatabasePerformanceStats(@Query('timeRange') timeRange?: string) {
    return this.performanceMonitorService.getDatabasePerformanceStats(timeRange);
  }

  @Get('cache/stats')
  @ApiOperation({ summary: '获取缓存性能统计' })
  @ApiQuery({ name: 'cacheType', description: '缓存类型', required: false })
  @ApiQuery({ name: 'timeRange', description: '时间范围(1h,24h,7d,30d)', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCachePerformanceStats(
    @Query('cacheType') cacheType?: string,
    @Query('timeRange') timeRange?: string,
  ) {
    return this.performanceMonitorService.getCachePerformanceStats(cacheType, timeRange);
  }

  @Get('system/resources')
  @ApiOperation({ summary: '获取系统资源使用情况' })
  @ApiQuery({ name: 'timeRange', description: '时间范围(1h,24h,7d,30d)', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSystemResourceStats(@Query('timeRange') timeRange?: string) {
    return this.performanceMonitorService.getSystemResourceStats(timeRange);
  }

  @Get('trends')
  @ApiOperation({ summary: '获取性能趋势数据' })
  @ApiQuery({ name: 'metricType', description: '指标类型', required: true })
  @ApiQuery({ name: 'days', description: '天数', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPerformanceTrends(
    @Query('metricType') metricType: string,
    @Query('days') days?: number,
  ) {
    return this.performanceMonitorService.getPerformanceTrends(metricType, days);
  }

  @Get('dashboard')
  @ApiOperation({ summary: '获取性能仪表盘数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPerformanceDashboard() {
    const [
      apiStats,
      dbStats,
      cacheStats,
      systemStats,
    ] = await Promise.all([
      this.performanceMonitorService.getApiPerformanceStats(undefined, '24h'),
      this.performanceMonitorService.getDatabasePerformanceStats('24h'),
      this.performanceMonitorService.getCachePerformanceStats(undefined, '24h'),
      this.performanceMonitorService.getSystemResourceStats('24h'),
    ]);

    return {
      api: apiStats,
      database: dbStats,
      cache: cacheStats,
      system: systemStats,
      timestamp: new Date().toISOString(),
    };
  }
}