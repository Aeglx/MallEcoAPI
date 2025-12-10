import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  /**
   * 获取商品销售统计
   */
  @ApiOperation({ summary: '获取商品销售统计' })
  @ApiResponse({ status: 200, description: '获取商品销售统计成功' })
  @Get('products')
  async getProductStatistics() {
    return await this.statisticsService.getProductStatistics();
  }

  /**
   * 获取热门商品
   */
  @ApiOperation({ summary: '获取热门商品' })
  @ApiQuery({ name: 'limit', description: '返回数量限制', required: false })
  @ApiResponse({ status: 200, description: '获取热门商品成功' })
  @Get('hot-products')
  async getHotProducts(@Query('limit') limit: string) {
    return await this.statisticsService.getHotProducts(parseInt(limit) || 10);
  }

  /**
   * 获取滞销商品
   */
  @ApiOperation({ summary: '获取滞销商品' })
  @ApiQuery({ name: 'limit', description: '返回数量限制', required: false })
  @ApiResponse({ status: 200, description: '获取滞销商品成功' })
  @Get('unsold-products')
  async getUnsoldProducts(@Query('limit') limit: string) {
    return await this.statisticsService.getUnsoldProducts(parseInt(limit) || 10);
  }

  /**
   * 获取系统概览数据
   */
  @ApiOperation({ summary: '获取系统概览数据' })
  @ApiResponse({ status: 200, description: '获取系统概览数据成功' })
  @Get('overview')
  async getSystemOverview() {
    return await this.statisticsService.getSystemOverview();
  }

  /**
   * 获取销售趋势统计
   */
  @ApiOperation({ summary: '获取销售趋势统计' })
  @ApiQuery({ name: 'days', description: '统计天数', required: false })
  @ApiResponse({ status: 200, description: '获取销售趋势统计成功' })
  @Get('sales-trend')
  async getSalesTrend(@Query('days') days: string) {
    return await this.statisticsService.getSalesTrend(parseInt(days) || 30);
  }

  /**
   * 获取分类销售统计
   */
  @ApiOperation({ summary: '获取分类销售统计' })
  @ApiResponse({ status: 200, description: '获取分类销售统计成功' })
  @Get('category')
  async getCategoryStatistics() {
    return await this.statisticsService.getCategoryStatistics();
  }

  /**
   * 获取价格区间统计
   */
  @ApiOperation({ summary: '获取价格区间统计' })
  @ApiResponse({ status: 200, description: '获取价格区间统计成功' })
  @Get('price-range')
  async getPriceRangeStatistics() {
    return await this.statisticsService.getPriceRangeStatistics();
  }

  /**
   * 获取内容管理统计
   */
  @ApiOperation({ summary: '获取内容管理统计' })
  @ApiResponse({ status: 200, description: '获取内容管理统计成功' })
  @Get('content')
  async getContentStatistics() {
    return await this.statisticsService.getContentStatistics();
  }

  /**
   * 获取文章阅读趋势
   */
  @ApiOperation({ summary: '获取文章阅读趋势' })
  @ApiQuery({ name: 'days', description: '统计天数', required: false })
  @ApiResponse({ status: 200, description: '获取文章阅读趋势成功' })
  @Get('article-trend')
  async getArticleTrend(@Query('days') days: string) {
    return await this.statisticsService.getArticleTrend(parseInt(days) || 30);
  }

  /**
   * 获取热门文章排行
   */
  @ApiOperation({ summary: '获取热门文章排行' })
  @ApiQuery({ name: 'limit', description: '返回数量限制', required: false })
  @ApiResponse({ status: 200, description: '获取热门文章排行成功' })
  @Get('hot-articles')
  async getHotArticles(@Query('limit') limit: string) {
    return await this.statisticsService.getHotArticles(parseInt(limit) || 10);
  }

  /**
   * 获取分类文章统计
   */
  @ApiOperation({ summary: '获取分类文章统计' })
  @ApiResponse({ status: 200, description: '获取分类文章统计成功' })
  @Get('category-articles')
  async getCategoryArticleStatistics() {
    return await this.statisticsService.getCategoryArticleStatistics();
  }

  /**
   * 获取用户活跃度统计
   */
  @ApiOperation({ summary: '获取用户活跃度统计' })
  @ApiQuery({ name: 'days', description: '统计天数', required: false })
  @ApiResponse({ status: 200, description: '获取用户活跃度统计成功' })
  @Get('user-activity')
  async getUserActivityStatistics(@Query('days') days: string) {
    return await this.statisticsService.getUserActivityStatistics(parseInt(days) || 30);
  }

  /**
   * 获取综合仪表盘数据
   */
  @ApiOperation({ summary: '获取综合仪表盘数据' })
  @ApiResponse({ status: 200, description: '获取综合仪表盘数据成功' })
  @Get('dashboard')
  async getDashboardStatistics() {
    return await this.statisticsService.getDashboardStatistics();
  }

  /**
   * 获取时间段统计对比
   */
  @ApiOperation({ summary: '获取时间段统计对比' })
  @ApiQuery({ name: 'currentDays', description: '当前时间段天数', required: false })
  @ApiQuery({ name: 'previousDays', description: '对比时间段天数', required: false })
  @ApiResponse({ status: 200, description: '获取时间段统计对比成功' })
  @Get('comparison')
  async getPeriodComparison(
    @Query('currentDays') currentDays: string,
    @Query('previousDays') previousDays: string
  ) {
    return await this.statisticsService.getPeriodComparison(
      parseInt(currentDays) || 7,
      parseInt(previousDays) || 7
    );
  }
}
