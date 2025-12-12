import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Query, 
  Param,
  Request,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PromotionService } from '../../common/promotion/services/promotion.service';
import { ResponseModel } from '../../common/interfaces/response.interface';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard';

@ApiTags('管理-营销活动')
@Controller('manager/promotion')
@UseGuards(JwtAuthGuard)
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post('create')
  @ApiOperation({ summary: '创建营销活动' })
  @ApiResponse({ status: 200, description: '创建成功' })
  async createPromotion(
    @Body() data: {
      name: string;
      type: number;
      startTime: Date;
      endTime: Date;
      description?: string;
      rules?: any;
      image?: string;
      link?: string;
      tags?: string;
      sortOrder?: number;
      budget?: number;
      remark?: string;
    },
    @Request() req: any,
  ): Promise<ResponseModel<any>> {
    const result = await this.promotionService.createPromotion({
      ...data,
      createBy: req.user.id,
    });
    return {
      code: 200,
      message: '创建成功',
      data: result,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Get('list')
  @ApiOperation({ summary: '获取营销活动列表' })
  @ApiQuery({ name: 'name', description: '活动名称', required: false })
  @ApiQuery({ name: 'type', description: '活动类型', required: false })
  @ApiQuery({ name: 'status', description: '状态', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPromotions(@Query() query: any): Promise<ResponseModel<any>> {
    const result = await this.promotionService.getPromotions(query);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Get('detail/:id')
  @ApiOperation({ summary: '获取营销活动详情' })
  @ApiParam({ name: 'id', description: '活动ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPromotionDetail(@Param('id') id: string): Promise<ResponseModel<any>> {
    const result = await this.promotionService.getPromotionDetail(id);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Put('update/:id')
  @ApiOperation({ summary: '更新营销活动' })
  @ApiParam({ name: 'id', description: '活动ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updatePromotion(
    @Param('id') id: string,
    @Body() updateData: any,
    @Request() req: any,
  ): Promise<ResponseModel<any>> {
    const result = await this.promotionService.updatePromotion(id, updateData, req.user.id);
    return {
      code: 200,
      message: '更新成功',
      data: result,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除营销活动' })
  @ApiParam({ name: 'id', description: '活动ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deletePromotion(@Param('id') id: string): Promise<ResponseModel<any>> {
    await this.promotionService.deletePromotion(id);
    return {
      code: 200,
      message: '删除成功',
      data: null,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Put('status/:id')
  @ApiOperation({ summary: '启用/禁用营销活动' })
  @ApiParam({ name: 'id', description: '活动ID' })
  @ApiResponse({ status: 200, description: '操作成功' })
  async toggleStatus(
    @Param('id') id: string,
    @Body() body: { status: number }
  ): Promise<ResponseModel<any>> {
    await this.promotionService.toggleStatus(id, body.status);
    return {
      code: 200,
      message: '操作成功',
      data: null,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Get('participants/:promotionId')
  @ApiOperation({ summary: '获取活动参与记录' })
  @ApiParam({ name: 'promotionId', description: '活动ID' })
  @ApiQuery({ name: 'status', description: '参与状态', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPromotionParticipants(
    @Param('promotionId') promotionId: string,
    @Query() query: any
  ): Promise<ResponseModel<any>> {
    const result = await this.promotionService.getPromotionParticipants(promotionId, query);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Post('complete/:participantId')
  @ApiOperation({ summary: '完成营销活动' })
  @ApiParam({ name: 'participantId', description: '参与记录ID' })
  @ApiResponse({ status: 200, description: '操作成功' })
  async completePromotion(
    @Param('participantId') participantId: string,
    @Body() data?: { rewardAmount?: number; completeData?: any }
  ): Promise<ResponseModel<any>> {
    await this.promotionService.completePromotion(participantId, data);
    return {
      code: 200,
      message: '操作成功',
      data: null,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Post('cancel/:participantId')
  @ApiOperation({ summary: '取消参与营销活动' })
  @ApiParam({ name: 'participantId', description: '参与记录ID' })
  @ApiResponse({ status: 200, description: '操作成功' })
  async cancelPromotion(@Param('participantId') participantId: string): Promise<ResponseModel<any>> {
    await this.promotionService.cancelPromotion(participantId);
    return {
      code: 200,
      message: '操作成功',
      data: null,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取营销活动统计' })
  @ApiQuery({ name: 'type', description: '活动类型', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStatistics(@Query() query: any): Promise<ResponseModel<any>> {
    const result = await this.promotionService.getStatistics(query);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Get('hot')
  @ApiOperation({ summary: '获取热门营销活动' })
  @ApiQuery({ name: 'limit', description: '数量限制', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getHotPromotions(@Query('limit') limit?: number): Promise<ResponseModel<any>> {
    const result = await this.promotionService.getHotPromotions(limit);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: '',
    };
  }
}