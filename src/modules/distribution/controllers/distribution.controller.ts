import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { DistributionService } from '../services/distribution.service';
import { DistributionApplyDTO } from '../dto/distribution-apply.dto';
import { DistributionSearchParams } from '../dto/distribution-search.dto';
import { Distribution } from '../entities/distribution.entity';
import { DistributionStatusEnum } from '../enums/distribution-status.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('分销员管理')
@Controller('distribution')
@UseGuards(JwtAuthGuard)
export class DistributionController {
  constructor(private readonly distributionService: DistributionService) {}

  @ApiOperation({ summary: '申请成为分销员' })
  @ApiResponse({ status: 200, description: '申请成功', type: Distribution })
  @Post('apply')
  async applyDistribution(
    @Request() req,
    @Body() applyDto: DistributionApplyDTO
  ): Promise<{ data: Distribution; message: string }> {
    const memberId = req.user.id;
    const memberName = req.user.username;
    
    const distribution = await this.distributionService.applyDistribution(
      memberId, 
      memberName, 
      applyDto
    );
    
    return {
      data: distribution,
      message: '申请提交成功，请等待审核'
    };
  }

  @ApiOperation({ summary: '获取当前用户的分销员信息' })
  @ApiResponse({ status: 200, description: '获取成功', type: Distribution })
  @Get('current')
  async getCurrentDistribution(@Request() req): Promise<{ data: Distribution }> {
    const memberId = req.user.id;
    
    // 检查分销设置
    await this.distributionService.checkDistributionSetting();
    
    const distribution = await this.distributionService.getDistributionByMemberId(memberId);
    
    return { data: distribution };
  }

  @ApiOperation({ summary: '绑定分销员' })
  @ApiParam({ name: 'distributionId', description: '分销员ID' })
  @ApiResponse({ status: 200, description: '绑定成功' })
  @Get('binding/:distributionId')
  async bindingDistribution(
    @Request() req,
    @Param('distributionId') distributionId: string
  ): Promise<{ message: string }> {
    const memberId = req.user.id;
    
    // 这里可以根据业务需求修改绑定逻辑
    await this.distributionService.bindingDistribution(memberId, distributionId);
    
    return { message: '绑定成功' };
  }

  @ApiOperation({ summary: '审核分销员申请' })
  @ApiParam({ name: 'id', description: '分销员ID' })
  @ApiResponse({ status: 200, description: '审核成功', type: Distribution })
  @Put('audit/:id')
  async auditDistribution(
    @Param('id') id: string,
    @Body() auditData: { 
      status: DistributionStatusEnum; 
      auditRemark?: string;
    }
  ): Promise<{ data: Distribution; message: string }> {
    const distribution = await this.distributionService.auditDistribution(
      id, 
      auditData.status, 
      auditData.auditRemark
    );
    
    const message = auditData.status === DistributionStatusEnum.PASS ? '审核通过' : '审核拒绝';
    
    return { data: distribution, message };
  }

  @ApiOperation({ summary: '获取分销员分页列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Get('list')
  async getDistributionList(
    @Query() searchParams: DistributionSearchParams
  ): Promise<{ 
    data: Distribution[]; 
    total: number; 
    page: number; 
    pageSize: number; 
  }> {
    const { items, total } = await this.distributionService.getDistributionList(searchParams);
    
    return {
      data: items,
      total,
      page: searchParams.page || 1,
      pageSize: searchParams.pageSize || 10
    };
  }

  @ApiOperation({ summary: '根据ID获取分销员信息' })
  @ApiParam({ name: 'id', description: '分销员ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: Distribution })
  @Get(':id')
  async getDistributionById(
    @Param('id') id: string
  ): Promise<{ data: Distribution }> {
    const distribution = await this.distributionService.getDistributionById(id);
    
    return { data: distribution };
  }

  @ApiOperation({ summary: '更新分销员信息' })
  @ApiParam({ name: 'id', description: '分销员ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: Distribution })
  @Put(':id')
  async updateDistribution(
    @Param('id') id: string,
    @Body() updateData: Partial<Distribution>
  ): Promise<{ data: Distribution; message: string }> {
    const distribution = await this.distributionService.updateDistribution(id, updateData);
    
    return {
      data: distribution,
      message: '更新成功'
    };
  }

  @ApiOperation({ summary: '启用/禁用分销员' })
  @ApiParam({ name: 'id', description: '分销员ID' })
  @ApiResponse({ status: 200, description: '操作成功', type: Distribution })
  @Put('toggle/:id')
  async toggleDistributionStatus(
    @Param('id') id: string
  ): Promise<{ data: Distribution; message: string }> {
    const distribution = await this.distributionService.toggleDistributionStatus(id);
    
    const message = distribution.distributionStatus === DistributionStatusEnum.PASS ? 
      '已启用分销员' : '已禁用分销员';
    
    return {
      data: distribution,
      message
    };
  }

  @ApiOperation({ summary: '删除分销员' })
  @ApiParam({ name: 'id', description: '分销员ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @Delete(':id')
  async deleteDistribution(
    @Param('id') id: string
  ): Promise<{ message: string }> {
    await this.distributionService.deleteDistribution(id);
    
    return { message: '删除成功' };
  }

  @ApiOperation({ summary: '获取分销员统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Get('statistics/overview')
  async getDistributionStatistics(): Promise<{ 
    data: {
      totalCount: number;
      pendingCount: number;
      activeCount: number;
      disabledCount: number;
    };
  }> {
    const statistics = await this.distributionService.getDistributionStatistics();
    
    return { data: statistics };
  }
}