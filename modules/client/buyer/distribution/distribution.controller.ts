import { Controller, Get, Post, Put, Query, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard';
import { DistributionService } from '../../common/distribution/distribution.service';
import { DistributionApplyDto } from '../../common/distribution/dto/distribution-apply.dto';
import { DistributionQueryDto, DistributionStatus } from '../../common/distribution/dto/distribution-query.dto';
import { DistributionCashApplyDto } from '../../common/distribution/dto/distribution-cash-apply.dto';
import { ResponseModel, PaginationResponse } from '../../common/interfaces/response.interface';
import { Distribution } from '../../common/distribution/entities/distribution.entity';
import { DistributionCashService } from '../../common/distribution/distribution-cash.service';

@ApiTags('买家分销管理')
@Controller('buyer/distribution')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DistributionController {
  constructor(
    private readonly distributionService: DistributionService,
    private readonly distributionCashService: DistributionCashService,
  ) {}

  @Post('apply')
  @ApiOperation({ summary: '申请成为分销员' })
  @ApiResponse({ status: 201, description: '申请成功' })
  async applyDistribution(
    @Request() req: any,
    @Body() applyDto: DistributionApplyDto,
  ): Promise<ResponseModel<{ distributionId: string }>> {
    const { userId } = req.user;
    const distribution = await this.distributionService.applyDistribution(userId, applyDto);
    
    return {
      code: 201,
      message: '申请提交成功，请等待审核',
      data: { distributionId: distribution.id },
      timestamp: Date.now(),
      traceId: req.id,
    };
  }

  @Get('my-info')
  @ApiOperation({ summary: '获取我的分销信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMyDistribution(@Request() req: any): Promise<ResponseModel<Distribution>> {
    const { userId } = req.user;
    const distribution = await this.distributionService.getMyDistribution(userId);
    
    return {
      code: 200,
      message: '获取成功',
      data: distribution,
      timestamp: Date.now(),
      traceId: req.id,
    };
  }

  @Get('team')
  @ApiOperation({ summary: '获取我的团队' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMyTeam(
    @Request() req: any,
    @Query('level') level: string = '1',
  ): Promise<ResponseModel<Distribution[]>> {
    const { userId } = req.user;
    const distribution = await this.distributionService.getMyDistribution(userId);
    const team = await this.distributionService.getMyTeam(distribution.id, parseInt(level));
    
    return {
      code: 200,
      message: '获取成功',
      data: team,
      timestamp: Date.now(),
      traceId: req.id,
    };
  }

  @Get('commission-summary')
  @ApiOperation({ summary: '获取佣金汇总' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCommissionSummary(@Request() req: any): Promise<ResponseModel<{
    totalCommission: number;
    availableCommission: number;
    frozenCommission: number;
    totalWithdraw: number;
    todayCommission: number;
    monthCommission: number;
  }>> {
    const { userId } = req.user;
    const distribution = await this.distributionService.getMyDistribution(userId);
    
    const summary = await this.distributionService.getCommissionSummary(distribution.id);
    
    return {
      code: 200,
      message: '获取成功',
      data: summary,
      timestamp: Date.now(),
      traceId: req.id,
    };
  }

  @Get('commission-records')
  @ApiOperation({ summary: '获取佣金记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCommissionRecords(
    @Request() req: any,
    @Query() queryDto: DistributionQueryDto,
  ): Promise<PaginationResponse<any>> {
    const { userId } = req.user;
    const distribution = await this.distributionService.getMyDistribution(userId);
    
    const records = await this.distributionService.getCommissionRecords(distribution.id, queryDto);
    
    return {
      code: 200,
      message: '获取成功',
      data: records,
      timestamp: Date.now(),
      traceId: req.id,
    };
  }

  @Post('cash-apply')
  @ApiOperation({ summary: '申请提现' })
  @ApiResponse({ status: 201, description: '申请成功' })
  async cashApply(
    @Request() req: any,
    @Body() cashApplyDto: DistributionCashApplyDto,
  ): Promise<ResponseModel<{ cashId: string }>> {
    const { userId } = req.user;
    const distribution = await this.distributionService.getMyDistribution(userId);
    
    const cash = await this.distributionCashService.applyCash(distribution.id, cashApplyDto);
    
    return {
      code: 201,
      message: '提现申请提交成功，请等待审核',
      data: { cashId: cash.id },
      timestamp: Date.now(),
      traceId: req.id,
    };
  }

  @Get('cash-records')
  @ApiOperation({ summary: '获取提现记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCashRecords(
    @Request() req: any,
    @Query() queryDto: DistributionQueryDto,
  ): Promise<PaginationResponse<any>> {
    const { userId } = req.user;
    const distribution = await this.distributionService.getMyDistribution(userId);
    
    const records = await this.distributionCashService.getCashRecords(distribution.id, queryDto);
    
    return {
      code: 200,
      message: '获取成功',
      data: records,
      timestamp: Date.now(),
      traceId: req.id,
    };
  }

  @Get('share-link')
  @ApiOperation({ summary: '获取分享链接' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getShareLink(@Request() req: any): Promise<ResponseModel<{
    shareUrl: string;
    qrCode: string;
    distributionCode: string;
  }>> {
    const { userId } = req.user;
    const distribution = await this.distributionService.getMyDistribution(userId);
    
    const shareInfo = await this.distributionService.getShareInfo(distribution.id);
    
    return {
      code: 200,
      message: '获取成功',
      data: shareInfo,
      timestamp: Date.now(),
      traceId: req.id,
    };
  }

  @Get('rankings')
  @ApiOperation({ summary: '获取排行榜' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRankings(
    @Query('type') type: string = 'commission',
    @Query('period') period: string = 'month',
  ): Promise<ResponseModel<any[]>> {
    const rankings = await this.distributionService.getRankings(type, period);
    
    return {
      code: 200,
      message: '获取成功',
      data: rankings,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取分销统计数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStatistics(@Request() req: any): Promise<ResponseModel<{
    todayOrders: number;
    todaySales: number;
    monthOrders: number;
    monthSales: number;
    totalOrders: number;
    totalSales: number;
    teamMembers: number;
    newMembersToday: number;
  }>> {
    const { userId } = req.user;
    const distribution = await this.distributionService.getMyDistribution(userId);
    
    const statistics = await this.distributionService.getStatistics(distribution.id);
    
    return {
      code: 200,
      message: '获取成功',
      data: statistics,
      timestamp: Date.now(),
      traceId: req.id,
    };
  }
}