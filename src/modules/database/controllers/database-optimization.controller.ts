import { Controller, Get, Post, Query, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { DatabaseOptimizationService } from '../services/database-optimization.service';
import { DatabaseAnalysisService } from '../services/database-analysis.service';

@ApiTags('数据库优化')
@Controller('database-optimization')
export class DatabaseOptimizationController {
  constructor(
    private readonly optimizationService: DatabaseOptimizationService,
    private readonly analysisService: DatabaseAnalysisService,
  ) {}

  @Get('performance/metrics')
  @ApiOperation({ summary: '获取数据库性能指标' })
  @ApiQuery({ name: 'startDate', description: '开始日期', required: true })
  @ApiQuery({ name: 'endDate', description: '结束日期', required: true })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPerformanceMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return await this.optimizationService.getPerformanceMetrics(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('performance/trends')
  @ApiOperation({ summary: '获取性能趋势数据' })
  @ApiQuery({ name: 'metricType', description: '指标类型', required: false })
  @ApiQuery({ name: 'days', description: '天数', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPerformanceTrends(
    @Query('metricType') metricType?: string,
    @Query('days') days?: number
  ) {
    return await this.optimizationService.getPerformanceTrends(
      metricType || 'ALL',
      days || 30
    );
  }

  @Get('indexes/usage')
  @ApiOperation({ summary: '获取索引使用情况' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getIndexUsage() {
    return await this.optimizationService.getIndexUsage();
  }

  @Get('indexes/optimization')
  @ApiOperation({ summary: '获取需要优化的索引' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getIndexesForOptimization() {
    return await this.optimizationService.getIndexesForOptimization();
  }

  @Post('indexes/optimize')
  @ApiOperation({ summary: '执行索引优化' })
  @ApiResponse({ status: 200, description: '优化执行成功' })
  async optimizeIndexes(@Body('indexIds') indexIds: number[]) {
    return await this.optimizationService.optimizeIndexes(indexIds);
  }

  @Get('queries/slow')
  @ApiOperation({ summary: '获取慢查询列表' })
  @ApiQuery({ name: 'limit', description: '限制数量', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSlowQueries(@Query('limit') limit?: number) {
    return await this.optimizationService.getSlowQueries(limit || 50);
  }

  @Get('queries/frequent')
  @ApiOperation({ summary: '获取高频查询' })
  @ApiQuery({ name: 'limit', description: '限制数量', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getFrequentQueries(@Query('limit') limit?: number) {
    return await this.optimizationService.getFrequentQueries(limit || 30);
  }

  @Get('queries/performance-stats')
  @ApiOperation({ summary: '获取查询性能统计' })
  @ApiQuery({ name: 'startDate', description: '开始日期', required: false })
  @ApiQuery({ name: 'endDate', description: '结束日期', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getQueryPerformanceStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return await this.optimizationService.getQueryPerformanceStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }

  @Get('suggestions')
  @ApiOperation({ summary: '生成数据库优化建议' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async generateOptimizationSuggestions() {
    return await this.optimizationService.generateOptimizationSuggestions();
  }

  @Get('health-score')
  @ApiOperation({ summary: '获取数据库健康评分' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDatabaseHealthScore() {
    return await this.optimizationService.getDatabaseHealthScore();
  }

  @Post('performance/metrics')
  @ApiOperation({ summary: '更新性能指标' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updatePerformanceMetrics(@Body() metrics: any[]) {
    return await this.optimizationService.updatePerformanceMetrics(metrics);
  }

  @Post('cleanup')
  @ApiOperation({ summary: '清理过期数据' })
  @ApiQuery({ name: 'daysToKeep', description: '保留天数', required: false })
  @ApiResponse({ status: 200, description: '清理成功' })
  async cleanupOldData(@Query('daysToKeep') daysToKeep?: number) {
    await this.optimizationService.cleanupOldData(daysToKeep || 90);
    return { message: '数据清理完成' };
  }
}

@ApiTags('数据库分析')
@Controller('database-analysis')
export class DatabaseAnalysisController {
  constructor(private readonly analysisService: DatabaseAnalysisService) {}

  @Get('connections')
  @ApiOperation({ summary: '分析数据库连接数' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async analyzeConnections() {
    return await this.analysisService.analyzeConnections();
  }

  @Get('lock-waits')
  @ApiOperation({ summary: '分析锁等待情况' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async analyzeLockWaits() {
    return await this.analysisService.analyzeLockWaits();
  }

  @Get('tablespaces')
  @ApiOperation({ summary: '分析表空间使用情况' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async analyzeTablespaces() {
    return await this.analysisService.analyzeTablespaces();
  }

  @Get('cache-hit-rates')
  @ApiOperation({ summary: '分析缓存命中率' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async analyzeCacheHitRates() {
    return await this.analysisService.analyzeCacheHitRates();
  }

  @Get('temporary-tables')
  @ApiOperation({ summary: '分析临时表使用情况' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async analyzeTemporaryTables() {
    return await this.analysisService.analyzeTemporaryTables();
  }

  @Get('sorting-operations')
  @ApiOperation({ summary: '分析排序操作' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async analyzeSortingOperations() {
    return await this.analysisService.analyzeSortingOperations();
  }

  @Get('full-analysis')
  @ApiOperation({ summary: '生成完整分析报告' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async generateFullAnalysis() {
    return await this.analysisService.generateFullAnalysis();
  }

  @Get('historical-analysis')
  @ApiOperation({ summary: '获取历史分析数据' })
  @ApiQuery({ name: 'days', description: '天数', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getHistoricalAnalysis(@Query('days') days?: number) {
    return await this.analysisService.getHistoricalAnalysis(days || 30);
  }

  @Get('compare-analysis')
  @ApiOperation({ summary: '比较分析结果' })
  @ApiQuery({ name: 'date1', description: '日期1', required: true })
  @ApiQuery({ name: 'date2', description: '日期2', required: true })
  @ApiResponse({ status: 200, description: '获取成功' })
  async compareAnalysis(
    @Query('date1') date1: string,
    @Query('date2') date2: string
  ) {
    return await this.analysisService.compareAnalysis(
      new Date(date1),
      new Date(date2)
    );
  }
}