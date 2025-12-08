import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  /**
   * 获取商品销售统计
   */
  @Get('products')
  async getProductStatistics() {
    return await this.statisticsService.getProductStatistics();
  }

  /**
   * 获取热门商品
   */
  @Get('hot-products')
  async getHotProducts(@Query('limit') limit: string) {
    return await this.statisticsService.getHotProducts(parseInt(limit) || 10);
  }

  /**
   * 获取滞销商品
   */
  @Get('unsold-products')
  async getUnsoldProducts(@Query('limit') limit: string) {
    return await this.statisticsService.getUnsoldProducts(parseInt(limit) || 10);
  }

  /**
   * 获取系统概览数据
   */
  @Get('overview')
  async getSystemOverview() {
    return await this.statisticsService.getSystemOverview();
  }
}
