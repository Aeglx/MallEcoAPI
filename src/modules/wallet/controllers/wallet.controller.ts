import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { WalletService } from '../services/wallet.service';
import { WalletEntity } from '../entities/wallet.entity';

@ApiTags('钱包管理')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('member/:memberId')
  @ApiOperation({ summary: '获取会员钱包信息' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: WalletEntity })
  async getMemberWallet(@Param('memberId') memberId: string) {
    return await this.walletService.getMemberWallet(memberId);
  }

  @Post('member/:memberId/recharge')
  @ApiOperation({ summary: '会员充值' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '充值成功' })
  async rechargeWallet(
    @Param('memberId') memberId: string,
    @Body() data: {
      amount: number;
      paymentMethod: string;
      rechargeSn: string;
      remark?: string;
    }
  ) {
    return await this.walletService.rechargeWallet(memberId, data);
  }

  @Post('member/:memberId/withdraw')
  @ApiOperation({ summary: '会员提现' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '提现申请成功' })
  async withdrawWallet(
    @Param('memberId') memberId: string,
    @Body() data: {
      amount: number;
      bankName: string;
      bankAccount: string;
      accountName: string;
      remark?: string;
    }
  ) {
    return await this.walletService.withdrawWallet(memberId, data);
  }

  @Get('member/:memberId/logs')
  @ApiOperation({ summary: '获取钱包流水记录' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'type', required: false, description: '流水类型' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  async getWalletLogs(
    @Param('memberId') memberId: string,
    @Query() params: {
      page?: number;
      pageSize?: number;
      type?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    return await this.walletService.getWalletLogs(memberId, params);
  }

  @Post('member/:memberId/transfer')
  @ApiOperation({ summary: '会员转账' })
  @ApiParam({ name: 'memberId', description: '转出会员ID' })
  @ApiResponse({ status: 200, description: '转账成功' })
  async transferWallet(
    @Param('memberId') fromMemberId: string,
    @Body() data: {
      toMemberId: string;
      amount: number;
      remark?: string;
    }
  ) {
    return await this.walletService.transferWallet(fromMemberId, data);
  }

  @Get('member/:memberId/statistics')
  @ApiOperation({ summary: '获取钱包统计信息' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  async getWalletStatistics(@Param('memberId') memberId: string) {
    return await this.walletService.getWalletStatistics(memberId);
  }

  @Post('member/:memberId/freeze')
  @ApiOperation({ summary: '冻结钱包金额' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '冻结成功' })
  async freezeWallet(
    @Param('memberId') memberId: string,
    @Body() data: {
      amount: number;
      freezeType: string;
      freezeReason: string;
      orderSn?: string;
    }
  ) {
    return await this.walletService.freezeWallet(memberId, data);
  }

  @Post('member/:memberId/unfreeze')
  @ApiOperation({ summary: '解冻钱包金额' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '解冻成功' })
  async unfreezeWallet(
    @Param('memberId') memberId: string,
    @Body() data: {
      freezeId: string;
      unfreezeReason: string;
    }
  ) {
    return await this.walletService.unfreezeWallet(memberId, data);
  }

  @Get('withdraw/applications')
  @ApiOperation({ summary: '获取提现申请列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'status', required: false, description: '申请状态' })
  @ApiQuery({ name: 'memberId', required: false, description: '会员ID' })
  async getWithdrawApplications(@Query() params: {
    page?: number;
    pageSize?: number;
    status?: string;
    memberId?: string;
  }) {
    return await this.walletService.getWithdrawApplications(params);
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
    return await this.walletService.approveWithdrawApplication(applicationId, data);
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
    return await this.walletService.rejectWithdrawApplication(applicationId, data);
  }

  @Get('recharge/records')
  @ApiOperation({ summary: '获取充值记录列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'status', required: false, description: '充值状态' })
  @ApiQuery({ name: 'memberId', required: false, description: '会员ID' })
  async getRechargeRecords(@Query() params: {
    page?: number;
    pageSize?: number;
    status?: string;
    memberId?: string;
  }) {
    return await this.walletService.getRechargeRecords(params);
  }

  @Post('recharge/:recordId/confirm')
  @ApiOperation({ summary: '确认充值到账' })
  @ApiParam({ name: 'recordId', description: '充值记录ID' })
  @ApiResponse({ status: 200, description: '确认成功' })
  async confirmRecharge(
    @Param('recordId') recordId: string,
    @Body() data: {
      confirmRemark?: string;
      operatorId: string;
    }
  ) {
    return await this.walletService.confirmRecharge(recordId, data);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取钱包总统计' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  async getWalletTotalStatistics(@Query() params: {
    startDate?: string;
    endDate?: string;
  }) {
    return await this.walletService.getWalletTotalStatistics(params);
  }
}