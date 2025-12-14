import { Controller, Get, Post, Put, Delete, Query, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { CacheOptimizationService } from '../services/cache-optimization.service';
import { CacheAnalysisService } from '../services/cache-analysis.service';

@ApiTags('缓存管理')
@Controller('cache-optimization')
export class CacheOptimizationController {
  constructor(
    private readonly optimizationService: CacheOptimizationService,
    private readonly analysisService: CacheAnalysisService
  ) {}

  @Get('performance/metrics')
  @ApiOperation({ summary: '获取缓存性能指标' })
  @ApiQuery({ name: 'startDate', description: '开始日期', required: true })
  @ApiQuery({ name: 'endDate', description: '结束日期', required: true })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPerformanceMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return await this.optimizationService.getCachePerformanceMetrics(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('status')
  @ApiOperation({ summary: '获取所有缓存类型状态' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getAllCacheStatus() {
    return await this.optimizationService.getAllCacheStatus();
  }

  @Get('configs')
  @ApiOperation({ summary: '获取缓存配置列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCacheConfigs() {
    return await this.optimizationService.getCacheConfigs();
  }

  @Get('configs/optimization-targets')
  @ApiOperation({ summary: '获取需要优化的缓存配置' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getOptimizationTargets() {
    return await this.optimizationService.getOptimizationTargets();
  }

  @Get('invalidation/history')
  @ApiOperation({ summary: '获取缓存失效历史' })
  @ApiQuery({ name: 'startDate', description: '开始日期', required: false })
  @ApiQuery({ name: 'endDate', description: '结束日期', required: false })
  @ApiQuery({ name: 'cacheType', description: '缓存类型', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getInvalidationHistory(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('cacheType') cacheType?: string
  ) {
    return await this.optimizationService.getInvalidationHistory(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      cacheType
    );
  }

  @Get('invalidation/patterns')
  @ApiOperation({ summary: '分析缓存失效模式' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async analyzeInvalidationPatterns() {
    return await this.optimizationService.analyzeInvalidationPatterns();
  }

  @Get('suggestions')
  @ApiOperation({ summary: '生成缓存优化建议' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async generateOptimizationSuggestions() {
    return await this.optimizationService.generateOptimizationSuggestions();
  }

  @Post('warmup')
  @ApiOperation({ summary: '执行缓存预热' })
  @ApiBody({ description: '缓存键列表' })
  @ApiResponse({ status: 200, description: '预热执行成功' })
  async warmupCache(@Body('cacheKeys') cacheKeys: string[]) {
    return await this.optimizationService.warmupCache(cacheKeys);
  }

  @Delete('clear')
  @ApiOperation({ summary: '批量清理缓存' })
  @ApiQuery({ name: 'cacheType', description: '缓存类型', required: false })
  @ApiQuery({ name: 'keyPattern', description: '键模式', required: false })
  @ApiResponse({ status: 200, description: '清理成功' })
  async clearCache(
    @Query('cacheType') cacheType?: string,
    @Query('keyPattern') keyPattern?: string
  ) {
    return await this.optimizationService.clearCache(cacheType, keyPattern);
  }

  @Put('configs/:cacheKey')
  @ApiOperation({ summary: '更新缓存配置' })
  @ApiParam({ name: 'cacheKey', description: '缓存键' })
  @ApiBody({ description: '配置更新' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateCacheConfig(
    @Param('cacheKey') cacheKey: string,
    @Body() updates: any
  ) {
    return await this.optimizationService.updateCacheConfig(cacheKey, updates);
  }

  @Post('configs')
  @ApiOperation({ summary: '添加缓存配置' })
  @ApiBody({ description: '新配置' })
  @ApiResponse({ status: 201, description: '添加成功' })
  async addCacheConfig(@Body() config: any) {
    return await this.optimizationService.addCacheConfig(config);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取缓存统计信息' })
  @ApiQuery({ name: 'cacheType', description: '缓存类型', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCacheStatistics(@Query('cacheType') cacheType?: string) {
    return await this.optimizationService.getCacheStatistics(cacheType);
  }

  @Post('performance-test')
  @ApiOperation({ summary: '模拟缓存性能测试' })
  @ApiQuery({ name: 'cacheType', description: '缓存类型', required: true })
  @ApiQuery({ name: 'operation', description: '操作类型', required: true })
  @ApiQuery({ name: 'count', description: '测试次数', required: false })
  @ApiResponse({ status: 200, description: '测试完成' })
  async simulateCachePerformanceTest(
    @Query('cacheType') cacheType: string,
    @Query('operation') operation: string,
    @Query('count') count?: number
  ) {
    return await this.optimizationService.simulateCachePerformanceTest(
      cacheType,
      operation,
      count || 100
    );
  }

  @Post('cleanup')
  @ApiOperation({ summary: '清理过期数据' })
  @ApiQuery({ name: 'daysToKeep', description: '保留天数', required: false })
  @ApiResponse({ status: 200, description: '清理成功' })
  async cleanupOldData(@Query('daysToKeep') daysToKeep?: number) {
    await this.optimizationService.cleanupOldData(daysToKeep || 30);
    return { message: '数据清理完成' };
  }
}
