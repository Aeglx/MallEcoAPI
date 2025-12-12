import { Controller, Get, Post, Put, Query, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard';
import { DistributionService } from '../../common/distribution/distribution.service';
import { DistributionApplyDto } from '../../common/distribution/dto/distribution-apply.dto';
import { DistributionAuditDto } from '../../common/distribution/dto/distribution-audit.dto';
import { DistributionQueryDto, DistributionStatus } from '../../common/distribution/dto/distribution-query.dto';
import { ResponseModel, PaginationResponse } from '../../common/interfaces/response.interface';
import { Distribution } from '../../common/distribution/entities/distribution.entity';
import { DistributionCashService } from '../../common/distribution/distribution-cash.service';

@ApiTags('管理端分销管理')
@Controller('manager/distribution')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ManagerDistributionController {
  constructor(
    private readonly distributionService: DistributionService,
    private readonly distributionCashService: DistributionCashService,
  ) {}

  @Get('list')
  @ApiOperation({ summary: '获取分销员列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDistributionList(
    @Query() queryDto: DistributionQueryDto,
  ): Promise<ResponseModel<{ items: Distribution[]; total: number }>> {
    const result = await this.distributionService.getDistributionList(queryDto);
    
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取分销员详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDistributionDetail(
    @Param('id') id: string,
  ): Promise<ResponseModel<Distribution>> {
    const distribution = await this.distributionService.getDistributionDetail(id);
    
    return {
      code: 200,
      message: '获取成功',
      data: distribution,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Post('audit')
  @ApiOperation({ summary: '审核分销员申请' })
  @ApiResponse({ status: 200, description: '审核成功' })
  async auditDistribution(
    @Body() auditDto: DistributionAuditDto,
    @Request() req: any,
  ): Promise<ResponseModel<Distribution>> {
    const { userId, username } = req.user;
    const distribution = await this.distributionService.auditDistribution(
      auditDto, 
      userId, 
      username
    );
    
    return {
      code: 200,
      message: '审核成功',
      data: distribution,
      timestamp: Date.now(),
      traceId: req.id,
    };
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新分销员状态' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateDistributionStatus(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string },
  ): Promise<ResponseModel<Distribution>> {
    const distribution = await this.distributionService.updateDistributionStatus(
      id, 
      body.status, 
      body.reason
    );
    
    return {
      code: 200,
      message: '更新成功',
      data: distribution,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Get(':id/team')
  @ApiOperation({ summary: '获取分销员团队' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDistributionTeam(
    @Param('id') id: string,
    @Query('level') level: string = '1',
  ): Promise<ResponseModel<Distribution[]>> {
    const team = await this.distributionService.getMyTeam(id, parseInt(level));
    
    return {
      code: 200,
      message: '获取成功',
      data: team,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Get('statistics/overview')
  @ApiOperation({ summary: '分销数据统计概览' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDistributionStatistics(): Promise<ResponseModel<{
    totalDistributors: number;
    activeDistributors: number;
    pendingApplications: number;
    todayApplications: number;
    totalCommission: number;
    todayCommission: number;
    totalCashAmount: number;
    pendingCashAmount: number;
  }>> {
    const statistics = await this.distributionService.getManagerStatistics();
    
    return {
      code: 200,
      message: '获取成功',
      data: statistics,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Get('statistics/rankings')
  @ApiOperation({ summary: '分销员排行榜' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDistributionRankings(
    @Query('type') type: string = 'commission',
    @Query('period') period: string = 'month',
    @Query('limit') limit: number = 10,
  ): Promise<ResponseModel<any[]>> {
    const rankings = await this.distributionService.getRankings(type, period, limit);
    
    return {
      code: 200,
      message: '获取成功',
      data: rankings,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Get('cash/list')
  @ApiOperation({ summary: '获取提现申请列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCashList(
    @Query() queryDto: DistributionQueryDto,
  ): Promise<ResponseModel<{ items: any[]; total: number }>> {
    // 由于是管理端接口，这里我们使用一个临时的分布员ID来获取所有提现记录
    // 实际上应该在service层添加一个专门的管理端方法来获取所有提现记录
    const result = await this.distributionCashService.getCashRecords('', queryDto);
    
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Get('cash/:id')
  @ApiOperation({ summary: '获取提现申请详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCashDetail(
    @Param('id') id: string,
  ): Promise<ResponseModel<any>> {
    const cash = await this.distributionCashService.getCashDetail(id);
    
    return {
      code: 200,
      message: '获取成功',
      data: cash,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Post('cash/audit')
  @ApiOperation({ summary: '审核提现申请' })
  @ApiResponse({ status: 200, description: '审核成功' })
  async auditCash(
    @Body() body: {
      cashId: string;
      status: string;
      auditReason?: string;
    },
    @Request() req: any,
  ): Promise<ResponseModel<any>> {
    const { userId } = req.user;
    const cash = await this.distributionCashService.auditCash(
      body.cashId,
      body.status,
      body.auditReason,
      userId
    );
    
    return {
      code: 200,
      message: '审核成功',
      data: cash,
      timestamp: Date.now(),
      traceId: req.id,
    };
  }

  @Post('cash/process')
  @ApiOperation({ summary: '处理提现' })
  @ApiResponse({ status: 200, description: '处理成功' })
  async processCash(
    @Body() body: {
      cashId: string;
      transactionNo: string;
    },
    @Request() req: any,
  ): Promise<ResponseModel<any>> {
    const { userId } = req.user;
    const cash = await this.distributionCashService.processCash(
      body.cashId,
      body.transactionNo,
      userId
    );
    
    return {
      code: 200,
      message: '处理成功',
      data: cash,
      timestamp: Date.now(),
      traceId: req.id,
    };
  }

  @Get('order/list')
  @ApiOperation({ summary: '获取分销订单列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDistributionOrderList(
    @Query() queryDto: any,
  ): Promise<ResponseModel<{ items: any[]; total: number }>> {
    const result = await this.distributionService.getDistributionOrderList(queryDto);
    
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Get('order/:id')
  @ApiOperation({ summary: '获取分销订单详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getDistributionOrderDetail(
    @Param('id') id: string,
  ): Promise<ResponseModel<any>> {
    const order = await this.distributionService.getDistributionOrderDetail(id);
    
    return {
      code: 200,
      message: '获取成功',
      data: order,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Get('commission/summary')
  @ApiOperation({ summary: '佣金结算汇总' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getCommissionSummary(
    @Query() queryDto: any,
  ): Promise<ResponseModel<{
    totalCommission: number;
    settledCommission: number;
    pendingCommission: number;
    todayCommission: number;
    monthCommission: number;
  }>> {
    const summary = await this.distributionService.getCommissionSummary(queryDto);
    
    return {
      code: 200,
      message: '获取成功',
      data: summary,
      timestamp: Date.now(),
      traceId: '',
    };
  }

  @Post('commission/settle')
  @ApiOperation({ summary: '批量结算佣金' })
  @ApiResponse({ status: 200, description: '结算成功' })
  async settleCommission(
    @Body() body: {
      orderIds?: string[];
      distributionIds?: string[];
      startDate?: string;
      endDate?: string;
    },
  ): Promise<ResponseModel<{
    settledCount: number;
    settledAmount: number;
  }>> {
    const result = await this.distributionService.settleCommission(body);
    
    return {
      code: 200,
      message: '结算成功',
      data: result,
      timestamp: Date.now(),
      traceId: '',
    };
  }
}