import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SeckillService } from '../services/seckill.service';
import { SeckillEntity } from '../entities/seckill.entity';

@ApiTags('秒杀活动')
@Controller('promotion/seckill')
export class SeckillController {
  constructor(private readonly seckillService: SeckillService) {}

  @Post()
  @ApiOperation({ summary: '创建秒杀活动' })
  @ApiResponse({ status: 201, description: '秒杀活动创建成功', type: SeckillEntity })
  async createSeckill(@Body() data: {
    seckillName: string;
    startTime: string;
    endTime: string;
    seckillPrice: number;
    originalPrice: number;
    stock: number;
    limitPerPerson: number;
    goodsId: string;
    storeId: string;
    images?: string[];
    description?: string;
    isActive?: boolean;
  }) {
    return await this.seckillService.createSeckill(data);
  }

  @Get()
  @ApiOperation({ summary: '获取秒杀活动列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'status', required: false, description: '活动状态' })
  @ApiQuery({ name: 'storeId', required: false, description: '店铺ID' })
  async getSeckillList(@Query() params: {
    page?: number;
    pageSize?: number;
    status?: string;
    storeId?: string;
  }) {
    return await this.seckillService.getSeckillList(params);
  }

  @Get(':seckillId')
  @ApiOperation({ summary: '获取秒杀活动详情' })
  @ApiParam({ name: 'seckillId', description: '秒杀活动ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: SeckillEntity })
  async getSeckillById(@Param('seckillId') seckillId: string) {
    return await this.seckillService.getSeckillById(seckillId);
  }

  @Put(':seckillId')
  @ApiOperation({ summary: '更新秒杀活动' })
  @ApiParam({ name: 'seckillId', description: '秒杀活动ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: SeckillEntity })
  async updateSeckill(
    @Param('seckillId') seckillId: string,
    @Body() updateData: Partial<SeckillEntity>
  ) {
    return await this.seckillService.updateSeckill(seckillId, updateData);
  }

  @Delete(':seckillId')
  @ApiOperation({ summary: '删除秒杀活动' })
  @ApiParam({ name: 'seckillId', description: '秒杀活动ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteSeckill(@Param('seckillId') seckillId: string) {
    return await this.seckillService.deleteSeckill(seckillId);
  }

  @Post(':seckillId/start')
  @ApiOperation({ summary: '开始秒杀活动' })
  @ApiParam({ name: 'seckillId', description: '秒杀活动ID' })
  @ApiResponse({ status: 200, description: '活动开始成功' })
  async startSeckill(@Param('seckillId') seckillId: string) {
    return await this.seckillService.startSeckill(seckillId);
  }

  @Post(':seckillId/end')
  @ApiOperation({ summary: '结束秒杀活动' })
  @ApiParam({ name: 'seckillId', description: '秒杀活动ID' })
  @ApiResponse({ status: 200, description: '活动结束成功' })
  async endSeckill(@Param('seckillId') seckillId: string) {
    return await this.seckillService.endSeckill(seckillId);
  }

  @Post(':seckillId/buy')
  @ApiOperation({ summary: '参与秒杀' })
  @ApiParam({ name: 'seckillId', description: '秒杀活动ID' })
  @ApiResponse({ status: 200, description: '秒杀成功' })
  async participateSeckill(
    @Param('seckillId') seckillId: string,
    @Body() data: {
      memberId: string;
      quantity: number;
      addressId: string;
    }
  ) {
    return await this.seckillService.participateSeckill(seckillId, data);
  }

  @Get('current')
  @ApiOperation({ summary: '获取当前进行的秒杀活动' })
  async getCurrentSeckills() {
    return await this.seckillService.getCurrentSeckills();
  }

  @Get('upcoming')
  @ApiOperation({ summary: '获取即将开始的秒杀活动' })
  async getUpcomingSeckills() {
    return await this.seckillService.getUpcomingSeckills();
  }

  @Get('member/:memberId/records')
  @ApiOperation({ summary: '获取会员秒杀记录' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  async getMemberSeckillRecords(
    @Param('memberId') memberId: string,
    @Query() params: { page?: number; pageSize?: number }
  ) {
    return await this.seckillService.getMemberSeckillRecords(memberId, params);
  }

  @Get('statistics/:seckillId')
  @ApiOperation({ summary: '获取秒杀活动统计' })
  @ApiParam({ name: 'seckillId', description: '秒杀活动ID' })
  async getSeckillStatistics(@Param('seckillId') seckillId: string) {
    return await this.seckillService.getSeckillStatistics(seckillId);
  }
}