import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DistributionService } from '../services/distribution.service';
import { DistributorEntity } from '../entities/distributor.entity';

@ApiTags('分销管理')
@Controller('distribution')
export class DistributionController {
  constructor(private readonly distributionService: DistributionService) {}

  @Post('apply')
  @ApiOperation({ summary: '申请成为分销员' })
  @ApiResponse({ status: 201, description: '申请提交成功', type: DistributorEntity })
  async applyDistributor(@Body() data: {
    memberId: string;
    realName: string;
    mobile: string;
    idCard?: string;
    wechat?: string;
    qq?: string;
    bankName?: string;
    bankAccount?: string;
    accountName?: string;
    applyReason?: string;
  }) {
    return await this.distributionService.applyDistributor(data);
  }

  @Get('distributors')
  @ApiOperation({ summary: '获取分销员列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'status', required: false, description: '分销员状态' })
  @ApiQuery({ name: 'level', required: false, description: '分销等级' })
  async getDistributorList(@Query() params: {
    page?: number;
    pageSize?: number;
    status?: string;
    level?: string;
  }) {
    return await this.distributionService.getDistributorList(params);
  }

  @Get('distributor/:distributorId')
  @ApiOperation({ summary: '获取分销员详情' })
  @ApiParam({ name: 'distributorId', description: '分销员ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: DistributorEntity })
  async getDistributorById(@Param('distributorId') distributorId: string) {
    return await this.distributionService.getDistributorById(distributorId);
  }

  @Get('distributor/member/:memberId')
  @ApiOperation({ summary: '根据会员ID获取分销员信息' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  async getDistributorByMemberId(@Param('memberId') memberId: string) {
    return await this.distributionService.getDistributorByMemberId(memberId);
  }

  @Put('distributor/:distributorId')
  @ApiOperation({ summary: '更新分销员信息' })
  @ApiParam({ name: 'distributorId', description: '分销员ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: DistributorEntity })
  async updateDistributor(
    @Param('distributorId') distributorId: string,
    @Body() updateData: Partial<DistributorEntity>
  ) {
    return await this.distributionService.updateDistributor(distributorId, updateData);
  }

  @Post('distributor/:distributorId/approve')
  @ApiOperation({ summary: '审核通过分销员' })
  @ApiParam({ name: 'distributorId', description: '分销员ID' })
  @ApiResponse({ status: 200, description: '审核通过' })
  async approveDistributor(
    @Param('distributorId') distributorId: string,
    @Body() data: {
      approveRemark?: string;
      operatorId: string;
    }
  ) {
    return await this.distributionService.approveDistributor(distributorId, data);
  }

  @Post('distributor/:distributorId/reject')
  @ApiOperation({ summary: '拒绝分销员申请' })
  @ApiParam({ name: 'distributorId', description: '分销员ID' })
  @ApiResponse({ status: 200, description: '拒绝成功' })
  async rejectDistributor(
    @Param('distributorId') distributorId: string,
    @Body() data: {
      rejectReason: string;
      operatorId: string;
    }
  ) {
    return await this.distributionService.rejectDistributor(distributorId, data);
  }

  @Post('distributor/:distributorId/freeze')
  @ApiOperation({ summary: '冻结分销员' })
  @ApiParam({ name: 'distributorId', description: '分销员ID' })
  @ApiResponse({ status: 200, description: '冻结成功' })
  async freezeDistributor(
    @Param('distributorId') distributorId: string,
    @Body() data: {
      freezeReason: string;
      operatorId: string;
    }
  ) {
    return await this.distributionService.freezeDistributor(distributorId, data);
  }

  @Post('distributor/:distributorId/unfreeze')
  @ApiOperation({ summary: '解冻分销员' })
  @ApiParam({ name: 'distributorId', description: '分销员ID' })
  @ApiResponse({ status: 200, description: '解冻成功' })
  async unfreezeDistributor(
    @Param('distributorId') distributorId: string,
    @Body() data: {
      unfreezeReason: string;
      operatorId: string;
    }
  ) {
    return await this.distributionService.unfreezeDistributor(distributorId, data);
  }

  @Post('distributor/:distributorId/level')
  @ApiOperation({ summary: '调整分销员等级' })
  @ApiParam({ name: 'distributorId', description: '分销员ID' })
  @ApiResponse({ status: 200, description: '等级调整成功' })
  async updateDistributorLevel(
    @Param('distributorId') distributorId: string,
    @Body() data: {
      levelId: string;
      reason?: string;
      operatorId: string;
    }
  ) {
    return await this.distributionService.updateDistributorLevel(distributorId, data);
  }

  @Get('commission/records')
  @ApiOperation({ summary: '获取佣金记录列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'distributorId', required: false, description: '分销员ID' })
  @ApiQuery({ name: 'type', required: false, description: '佣金类型' })
  @ApiQuery({ name: 'status', required: false, description: '佣金状态' })
  async getCommissionRecords(@Query() params: {
    page?: number;
    pageSize?: number;
    distributorId?: string;
    type?: string;
    status?: string;
  }) {
    return await this.distributionService.getCommissionRecords(params);
  }

  @Get('distributor/:distributorId/commission')
  @ApiOperation({ summary: '获取分销员佣金统计' })
  @ApiParam({ name: 'distributorId', description: '分销员ID' })
  async getDistributorCommission(@Param('distributorId') distributorId: string) {
    return await this.distributionService.getDistributorCommission(distributorId);
  }

  @Post('commission/withdraw')
  @ApiOperation({ summary: '申请佣金提现' })
  @ApiResponse({ status: 200, description: '提现申请成功' })
  async applyCommissionWithdraw(@Body() data: {
    distributorId: string;
    withdrawAmount: number;
    bankName: string;
    bankAccount: string;
    accountName: string;
  }) {
    return await this.distributionService.applyCommissionWithdraw(data);
  }

  @Get('withdraw/applications')
  @ApiOperation({ summary: '获取提现申请列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'status', required: false, description: '申请状态' })
  async getWithdrawApplications(@Query() params: {
    page?: number;
    pageSize?: number;
    status?: string;
  }) {
    return await this.distributionService.getWithdrawApplications(params);
  }

  @Post('withdraw/:applicationId/approve')
  @ApiOperation({ summary: '审核通过提现申请' })
  @ApiParam({ name: 'applicationId', description: '提现申请ID' })
  @ApiResponse({ status: 200, description: '审核通过' })
  async approveWithdrawApplication(
    @Param('applicationId') applicationId: string,
    @Body() data: {
      approveRemark?: string;
      operatorId: string;
    }
  ) {
    return await this.distributionService.approveWithdrawApplication(applicationId, data);
  }

  @Post('withdraw/:applicationId/reject')
  @ApiOperation({ summary: '拒绝提现申请' })
  @ApiParam({ name: 'applicationId', description: '提现申请ID' })
  @ApiResponse({ status: 200, description: '拒绝成功' })
  async rejectWithdrawApplication(
    @Param('applicationId') applicationId: string,
    @Body() data: {
      rejectReason: string;
      operatorId: string;
    }
  ) {
    return await this.distributionService.rejectWithdrawApplication(applicationId, data);
  }

  @Get('team/:distributorId')
  @ApiOperation({ summary: '获取分销团队' })
  @ApiParam({ name: 'distributorId', description: '分销员ID' })
  @ApiQuery({ name: 'level', required: false, description: '团队层级' })
  async getDistributionTeam(
    @Param('distributorId') distributorId: string,
    @Query('level') level?: string
  ) {
    return await this.distributionService.getDistributionTeam(distributorId, level);
  }

  @Get('goods')
  @ApiOperation({ summary: '获取分销商品列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'storeId', required: false, description: '店铺ID' })
  async getDistributionGoods(@Query() params: {
    page?: number;
    pageSize?: number;
    storeId?: string;
  }) {
    return await this.distributionService.getDistributionGoods(params);
  }

  @Post('goods/:goodsId/commission')
  @ApiOperation({ summary: '设置分销商品佣金' })
  @ApiParam({ name: 'goodsId', description: '商品ID' })
  @ApiResponse({ status: 200, description: '佣金设置成功' })
  async setGoodsCommission(
    @Param('goodsId') goodsId: string,
    @Body() data: {
      commissionRate: number;
      fixedCommission?: number;
      isActive: boolean;
    }
  ) {
    return await this.distributionService.setGoodsCommission(goodsId, data);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取分销统计' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  async getDistributionStatistics(@Query() params: {
    startDate?: string;
    endDate?: string;
  }) {
    return await this.distributionService.getDistributionStatistics(params);
  }

  @Post('invite/:inviteCode')
  @ApiOperation({ summary: '通过邀请码注册' })
  @ApiParam({ name: 'inviteCode', description: '邀请码' })
  @ApiResponse({ status: 200, description: '注册成功' })
  async registerByInviteCode(
    @Param('inviteCode') inviteCode: string,
    @Body() data: {
      memberId: string;
      realName: string;
      mobile: string;
    }
  ) {
    return await this.distributionService.registerByInviteCode(inviteCode, data);
  }

  @Get('distributor/:distributorId/invite')
  @ApiOperation({ summary: '获取分销员邀请信息' })
  @ApiParam({ name: 'distributorId', description: '分销员ID' })
  async getDistributorInviteInfo(@Param('distributorId') distributorId: string) {
    return await this.distributionService.getDistributorInviteInfo(distributorId);
  }
}