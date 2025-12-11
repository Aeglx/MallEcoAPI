import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LogisticsService } from '../services/logistics.service';
import { LogisticsEntity } from '../entities/logistics.entity';

@ApiTags('物流管理')
@Controller('logistics')
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Get('companies')
  @ApiOperation({ summary: '获取物流公司列表' })
  async getLogisticsCompanies() {
    return await this.logisticsService.getLogisticsCompanies();
  }

  @Post('order/:orderSn/ship')
  @ApiOperation({ summary: '订单发货' })
  @ApiParam({ name: 'orderSn', description: '订单号' })
  @ApiResponse({ status: 200, description: '发货成功' })
  async shipOrder(
    @Param('orderSn') orderSn: string,
    @Body() data: {
      logisticsCompany: string;
      logisticsNumber: string;
      shipTime: string;
      operatorId: string;
    }
  ) {
    return await this.logisticsService.shipOrder(orderSn, data);
  }

  @Get('order/:orderSn/track')
  @ApiOperation({ summary: '查询物流轨迹' })
  @ApiParam({ name: 'orderSn', description: '订单号' })
  async getLogisticsTrack(@Param('orderSn') orderSn: string) {
    return await this.logisticsService.getLogisticsTrack(orderSn);
  }

  @Get('track/:logisticsNumber')
  @ApiOperation({ summary: '根据物流单号查询轨迹' })
  @ApiParam({ name: 'logisticsNumber', description: '物流单号' })
  async getTrackByNumber(@Param('logisticsNumber') logisticsNumber: string) {
    return await this.logisticsService.getTrackByNumber(logisticsNumber);
  }

  @Post('template')
  @ApiOperation({ summary: '创建运费模板' })
  @ApiResponse({ status: 201, description: '模板创建成功', type: LogisticsEntity })
  async createFreightTemplate(@Body() data: {
    templateName: string;
    storeId: string;
    isFreeShipping: boolean;
    freeShippingCondition?: number;
    calculationType: string; // WEIGHT:按重量, VOLUME:按体积, PIECE:按件数
    defaultFirstWeight: number;
    defaultFirstPrice: number;
    defaultContinueWeight: number;
    defaultContinuePrice: number;
    regions?: Array<{
      regionIds: string[];
      firstWeight: number;
      firstPrice: number;
      continueWeight: number;
      continuePrice: number;
    }>;
  }) {
    return await this.logisticsService.createFreightTemplate(data);
  }

  @Get('templates')
  @ApiOperation({ summary: '获取运费模板列表' })
  @ApiQuery({ name: 'storeId', required: false, description: '店铺ID' })
  async getFreightTemplates(@Query('storeId') storeId?: string) {
    return await this.logisticsService.getFreightTemplates(storeId);
  }

  @Get('template/:templateId')
  @ApiOperation({ summary: '获取运费模板详情' })
  @ApiParam({ name: 'templateId', description: '模板ID' })
  async getFreightTemplate(@Param('templateId') templateId: string) {
    return await this.logisticsService.getFreightTemplate(templateId);
  }

  @Put('template/:templateId')
  @ApiOperation({ summary: '更新运费模板' })
  @ApiParam({ name: 'templateId', description: '模板ID' })
  async updateFreightTemplate(
    @Param('templateId') templateId: string,
    @Body() updateData: Partial<LogisticsEntity>
  ) {
    return await this.logisticsService.updateFreightTemplate(templateId, updateData);
  }

  @Delete('template/:templateId')
  @ApiOperation({ summary: '删除运费模板' })
  @ApiParam({ name: 'templateId', description: '模板ID' })
  async deleteFreightTemplate(@Param('templateId') templateId: string) {
    return await this.logisticsService.deleteFreightTemplate(templateId);
  }

  @Post('calculate')
  @ApiOperation({ summary: '计算运费' })
  async calculateFreight(@Body() data: {
    templateId: string;
    goodsWeight: number;
    goodsVolume: number;
    goodsQuantity: number;
    regionId: string;
  }) {
    return await this.logisticsService.calculateFreight(data);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取物流统计' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiQuery({ name: 'storeId', required: false, description: '店铺ID' })
  async getLogisticsStatistics(@Query() params: {
    startDate?: string;
    endDate?: string;
    storeId?: string;
  }) {
    return await this.logisticsService.getLogisticsStatistics(params);
  }
}