import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EvaluationService } from '../services/evaluation.service';
import { EvaluationEntity } from '../entities/evaluation.entity';

@ApiTags('商品评价')
@Controller('evaluation')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  @ApiOperation({ summary: '创建商品评价' })
  @ApiResponse({ status: 201, description: '评价创建成功', type: EvaluationEntity })
  async createEvaluation(@Body() data: {
    orderSn: string;
    goodsId: string;
    memberId: string;
    score: number;
    content: string;
    images?: string[];
    isAnonymous?: boolean;
    deliveryScore?: number;
    serviceScore?: number;
  }) {
    return await this.evaluationService.createEvaluation(data);
  }

  @Get()
  @ApiOperation({ summary: '获取评价列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'goodsId', required: false, description: '商品ID' })
  @ApiQuery({ name: 'memberId', required: false, description: '会员ID' })
  @ApiQuery({ name: 'score', required: false, description: '评分' })
  async getEvaluationList(@Query() params: {
    page?: number;
    pageSize?: number;
    goodsId?: string;
    memberId?: string;
    score?: number;
  }) {
    return await this.evaluationService.getEvaluationList(params);
  }

  @Get(':evaluationId')
  @ApiOperation({ summary: '获取评价详情' })
  @ApiParam({ name: 'evaluationId', description: '评价ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: EvaluationEntity })
  async getEvaluationById(@Param('evaluationId') evaluationId: string) {
    return await this.evaluationService.getEvaluationById(evaluationId);
  }

  @Put(':evaluationId')
  @ApiOperation({ summary: '更新评价' })
  @ApiParam({ name: 'evaluationId', description: '评价ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: EvaluationEntity })
  async updateEvaluation(
    @Param('evaluationId') evaluationId: string,
    @Body() updateData: Partial<EvaluationEntity>
  ) {
    return await this.evaluationService.updateEvaluation(evaluationId, updateData);
  }

  @Delete(':evaluationId')
  @ApiOperation({ summary: '删除评价' })
  @ApiParam({ name: 'evaluationId', description: '评价ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteEvaluation(@Param('evaluationId') evaluationId: string) {
    return await this.evaluationService.deleteEvaluation(evaluationId);
  }

  @Post(':evaluationId/reply')
  @ApiOperation({ summary: '商家回复评价' })
  @ApiParam({ name: 'evaluationId', description: '评价ID' })
  @ApiResponse({ status: 200, description: '回复成功' })
  async replyEvaluation(
    @Param('evaluationId') evaluationId: string,
    @Body() data: {
      replyContent: string;
      storeId: string;
    }
  ) {
    return await this.evaluationService.replyEvaluation(evaluationId, data);
  }

  @Post(':evaluationId/like')
  @ApiOperation({ summary: '点赞评价' })
  @ApiParam({ name: 'evaluationId', description: '评价ID' })
  @ApiResponse({ status: 200, description: '点赞成功' })
  async likeEvaluation(@Param('evaluationId') evaluationId: string) {
    return await this.evaluationService.likeEvaluation(evaluationId);
  }

  @Delete(':evaluationId/like')
  @ApiOperation({ summary: '取消点赞评价' })
  @ApiParam({ name: 'evaluationId', description: '评价ID' })
  @ApiResponse({ status: 200, description: '取消点赞成功' })
  async unlikeEvaluation(@Param('evaluationId') evaluationId: string) {
    return await this.evaluationService.unlikeEvaluation(evaluationId);
  }

  @Get('goods/:goodsId')
  @ApiOperation({ summary: '获取商品评价列表' })
  @ApiParam({ name: 'goodsId', description: '商品ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'score', required: false, description: '评分' })
  async getGoodsEvaluations(
    @Param('goodsId') goodsId: string,
    @Query() params: {
      page?: number;
      pageSize?: number;
      score?: number;
    }
  ) {
    return await this.evaluationService.getGoodsEvaluations(goodsId, params);
  }

  @Get('goods/:goodsId/statistics')
  @ApiOperation({ summary: '获取商品评价统计' })
  @ApiParam({ name: 'goodsId', description: '商品ID' })
  async getGoodsEvaluationStatistics(@Param('goodsId') goodsId: string) {
    return await this.evaluationService.getGoodsEvaluationStatistics(goodsId);
  }

  @Get('store/:storeId')
  @ApiOperation({ summary: '获取店铺评价列表' })
  @ApiParam({ name: 'storeId', description: '店铺ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  async getStoreEvaluations(
    @Param('storeId') storeId: string,
    @Query() params: { page?: number; pageSize?: number }
  ) {
    return await this.evaluationService.getStoreEvaluations(storeId, params);
  }

  @Get('store/:storeId/statistics')
  @ApiOperation({ summary: '获取店铺评价统计' })
  @ApiParam({ name: 'storeId', description: '店铺ID' })
  async getStoreEvaluationStatistics(@Param('storeId') storeId: string) {
    return await this.evaluationService.getStoreEvaluationStatistics(storeId);
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: '获取会员评价列表' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  async getMemberEvaluations(
    @Param('memberId') memberId: string,
    @Query() params: { page?: number; pageSize?: number }
  ) {
    return await this.evaluationService.getMemberEvaluations(memberId, params);
  }

  @Post(':evaluationId/report')
  @ApiOperation({ summary: '举报评价' })
  @ApiParam({ name: 'evaluationId', description: '评价ID' })
  @ApiResponse({ status: 200, description: '举报成功' })
  async reportEvaluation(
    @Param('evaluationId') evaluationId: string,
    @Body() data: {
      reportReason: string;
      reporterId: string;
    }
  ) {
    return await this.evaluationService.reportEvaluation(evaluationId, data);
  }

  @Get('admin/reports')
  @ApiOperation({ summary: '获取举报列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'status', required: false, description: '处理状态' })
  async getReportList(@Query() params: {
    page?: number;
    pageSize?: number;
    status?: string;
  }) {
    return await this.evaluationService.getReportList(params);
  }

  @Post('report/:reportId/handle')
  @ApiOperation({ summary: '处理举报' })
  @ApiParam({ name: 'reportId', description: '举报ID' })
  @ApiResponse({ status: 200, description: '处理成功' })
  async handleReport(
    @Param('reportId') reportId: string,
    @Body() data: {
      handleResult: string;
      operatorId: string;
    }
  ) {
    return await this.evaluationService.handleReport(reportId, data);
  }
}