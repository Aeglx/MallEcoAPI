import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { DistributionCashService } from '../services/distribution-cash.service';
import { DistributionCash } from '../entities/distribution-cash.entity';
import { DistributionCashStatusEnum } from '../entities/distribution-cash.entity';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';

@ApiTags('分销提现管理')
@Controller('distribution-cash')
@UseGuards(JwtAuthGuard)
export class DistributionCashController {
  constructor(private readonly distributionCashService: DistributionCashService) {}

  @ApiOperation({ summary: '申请提现' })
  @ApiResponse({ status: 200, description: '申请成功', type: DistributionCash })
  @Post('apply')
  async applyCash(
    @Body() cashData: Partial<DistributionCash>,
    @Request() req
  ): Promise<{ data: DistributionCash; message: string }> {
    cashData.createBy = req.user.id;
    
    const distributionCash = await this.distributionCashService.applyCash(cashData);
    
    return {
      data: distributionCash,
      message: '提现申请提交成功，请等待审核'
    };
  }

  @ApiOperation({ summary: '审核提现申请' })
  @ApiParam({ name: 'id', description: '提现申请ID' })
  @ApiResponse({ status: 200, description: '审核成功', type: DistributionCash })
  @Put('audit/:id')
  async auditCash(
    @Param('id') id: string,
    @Body() auditData: { 
      status: DistributionCashStatusEnum;
      auditRemark?: string;
    },
    @Request() req
  ): Promise<{ data: DistributionCash; message: string }> {
    const distributionCash = await this.distributionCashService.auditCash(
      id, 
      auditData.status, 
      auditData.auditRemark,
      req.user.id
    );
    
    const message = auditData.status === DistributionCashStatusEnum.APPROVED ? 
      '提现审核通过' : '提现审核拒绝';
    
    return {
      data: distributionCash,
      message
    };
  }

  @ApiOperation({ summary: '获取提现申请详情' })
  @ApiParam({ name: 'id', description: '提现申请ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: DistributionCash })
  @Get(':id')
  async getCashById(
    @Param('id') id: string
  ): Promise<{ data: DistributionCash }> {
    const distributionCash = await this.distributionCashService.getCashById(id);
    
    return { data: distributionCash };
  }

  @ApiOperation({ summary: '获取分销员的提现记录' })
  @ApiParam({ name: 'distributionId', description: '分销员ID' })
  @ApiResponse({ status: 200, description: '获取成功', isArray: true, type: DistributionCash })
  @Get('distribution/:distributionId')
  async getCashByDistributionId(
    @Param('distributionId') distributionId: string
  ): Promise<{ data: DistributionCash[] }> {
    const distributionCash = await this.distributionCashService.getCashByDistributionId(distributionId);
    
    return { data: distributionCash };
  }

  @ApiOperation({ summary: '获取当前用户的提现记录' })
  @ApiResponse({ status: 200, description: '获取成功', isArray: true, type: DistributionCash })
  @Get('current/list')
  async getCurrentUserCashList(
    @Request() req
  ): Promise<{ data: DistributionCash[] }> {
    // 这里需要先获取用户的分销员ID，然后获取提现记录
    // 暂时作为示例代码
    const distributionId = req.user.distributionId; // 假设用户信息中有分销员ID
    
    if (!distributionId) {
      return { data: [] };
    }
    
    const distributionCash = await this.distributionCashService.getCashByDistributionId(distributionId);
    
    return { data: distributionCash };
  }

  @ApiOperation({ summary: '分页查询提现记录' })
  @ApiQuery({ name: 'distributionId', description: '分销员ID', required: false })
  @ApiQuery({ name: 'cashStatus', description: '提现状态', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false })
  @ApiQuery({ name: 'pageSize', description: '每页大小', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Get('list')
  async getCashList(
    @Query('distributionId') distributionId?: string,
    @Query('cashStatus') cashStatus?: DistributionCashStatusEnum,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ): Promise<{ 
    data: DistributionCash[]; 
    total: number; 
    page: number; 
    pageSize: number; 
  }> {
    const { items, total } = await this.distributionCashService.getCashList(
      distributionId,
      cashStatus,
      startTime,
      endTime,
      page || 1,
      pageSize || 10
    );
    
    return {
      data: items,
      total,
      page: page || 1,
      pageSize: pageSize || 10
    };
  }

  @ApiOperation({ summary: '获取提现统计信息' })
  @ApiQuery({ name: 'distributionId', description: '分销员ID', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Get('statistics/overview')
  async getCashStatistics(
    @Query('distributionId') distributionId?: string
  ): Promise<{ data: any }> {
    const statistics = await this.distributionCashService.getCashStatistics(distributionId);
    
    return { data: statistics };
  }
}
