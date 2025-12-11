import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PointsService } from '../services/points.service';
import { PointsEntity } from '../entities/points.entity';

@ApiTags('积分管理')
@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('member/:memberId')
  @ApiOperation({ summary: '获取会员积分信息' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: PointsEntity })
  async getMemberPoints(@Param('memberId') memberId: string) {
    return await this.pointsService.getMemberPoints(memberId);
  }

  @Post('member/:memberId/add')
  @ApiOperation({ summary: '增加会员积分' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '积分增加成功' })
  async addPoints(
    @Param('memberId') memberId: string,
    @Body() data: {
      points: number;
      reason: string;
      remark?: string;
      operatorId: string;
    }
  ) {
    return await this.pointsService.addPoints(memberId, data);
  }

  @Post('member/:memberId/deduct')
  @ApiOperation({ summary: '扣除会员积分' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '积分扣除成功' })
  async deductPoints(
    @Param('memberId') memberId: string,
    @Body() data: {
      points: number;
      reason: string;
      remark?: string;
      operatorId: string;
    }
  ) {
    return await this.pointsService.deductPoints(memberId, data);
  }

  @Get('member/:memberId/logs')
  @ApiOperation({ summary: '获取会员积分记录' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'type', required: false, description: '积分类型' })
  async getPointsLogs(
    @Param('memberId') memberId: string,
    @Query() params: {
      page?: number;
      pageSize?: number;
      type?: string;
    }
  ) {
    return await this.pointsService.getPointsLogs(memberId, params);
  }

  @Post('exchange')
  @ApiOperation({ summary: '积分兑换' })
  @ApiResponse({ status: 200, description: '兑换成功' })
  async exchangePoints(@Body() data: {
    memberId: string;
    goodsId: string;
    quantity: number;
    addressId: string;
  }) {
    return await this.pointsService.exchangePoints(data);
  }

  @Get('goods')
  @ApiOperation({ summary: '获取积分商品列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  async getPointsGoods(@Query() params: { page?: number; pageSize?: number }) {
    return await this.pointsService.getPointsGoods(params);
  }

  @Post('goods')
  @ApiOperation({ summary: '创建积分商品' })
  @ApiResponse({ status: 201, description: '商品创建成功' })
  async createPointsGoods(@Body() data: {
    goodsName: string;
    pointsPrice: number;
    cashPrice: number;
    stock: number;
    images: string[];
    description: string;
    isActive: boolean;
  }) {
    return await this.pointsService.createPointsGoods(data);
  }

  @Put('goods/:goodsId')
  @ApiOperation({ summary: '更新积分商品' })
  @ApiParam({ name: 'goodsId', description: '商品ID' })
  async updatePointsGoods(
    @Param('goodsId') goodsId: string,
    @Body() updateData: Partial<any>
  ) {
    return await this.pointsService.updatePointsGoods(goodsId, updateData);
  }

  @Get('rules')
  @ApiOperation({ summary: '获取积分规则' })
  async getPointsRules() {
    return await this.pointsService.getPointsRules();
  }

  @Put('rules')
  @ApiOperation({ summary: '更新积分规则' })
  async updatePointsRules(@Body() data: {
    signInPoints: number;
    orderPointsRate: number;
    evaluationPoints: number;
    sharePoints: number;
    maxPointsPerDay: number;
  }) {
    return await this.pointsService.updatePointsRules(data);
  }

  @Post('member/:memberId/signin')
  @ApiOperation({ summary: '会员签到' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '签到成功' })
  async signIn(@Param('memberId') memberId: string) {
    return await this.pointsService.signIn(memberId);
  }

  @Get('member/:memberId/signin/records')
  @ApiOperation({ summary: '获取会员签到记录' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiQuery({ name: 'month', required: false, description: '月份' })
  async getSignInRecords(
    @Param('memberId') memberId: string,
    @Query('month') month?: string
  ) {
    return await this.pointsService.getSignInRecords(memberId, month);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取积分统计' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  async getPointsStatistics(@Query() params: {
    startDate?: string;
    endDate?: string;
  }) {
    return await this.pointsService.getPointsStatistics(params);
  }
}