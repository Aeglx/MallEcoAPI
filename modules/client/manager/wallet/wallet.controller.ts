import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Query, 
  Param 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { WalletService } from '../../common/wallet/services/wallet.service';
import { RechargeService } from '../../common/wallet/services/recharge.service';
import { WithdrawService } from '../../common/wallet/services/withdraw.service';
import { PointsService } from '../../common/wallet/services/points.service';
import { WalletSecurityService } from '../../common/wallet/services/wallet-security.service';
import { WalletStatisticsService } from '../../common/wallet/services/wallet-statistics.service';
import { ResponseUtil } from '../../common/utils/response.util';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Response } from '../../common/interfaces/response.interface';

@ApiTags('管理-钱包')
@Controller('manager/wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly rechargeService: RechargeService,
    private readonly withdrawService: WithdrawService,
    private readonly pointsService: PointsService,
    private readonly walletSecurityService: WalletSecurityService,
    private readonly walletStatisticsService: WalletStatisticsService,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: '钱包总览统计' })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWalletOverview(@Query() query: any): Promise<Response<any>> {
    const result = await this.walletStatisticsService.getWalletOverview(query);
    return ResponseUtil.success(result);
  }

  @Get('records')
  @ApiOperation({ summary: '获取钱包流水记录' })
  @ApiQuery({ name: 'memberId', description: '会员ID', required: false })
  @ApiQuery({ name: 'type', description: '变动类型', required: false })
  @ApiQuery({ name: 'direction', description: '变动方向', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWalletRecords(@Query() query: any): Promise<Response<any>> {
    const result = await this.walletService.getWalletRecords(query);
    return ResponseUtil.success(result);
  }

  @Post('freeze/:memberId')
  @ApiOperation({ summary: '冻结会员钱包' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '冻结成功' })
  async freezeWallet(
    @Param('memberId') memberId: string,
    @Body() body: { 
      amount: number;
      reason: string;
      remark?: string;
    },
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    const result = await this.walletService.changeFrozenBalance({
      memberId,
      type: 1, // 冻结
      amount: body.amount,
      businessType: 'MANUAL_FREEZE',
      description: `管理员冻结：${body.reason}`,
      operatorId: user.id,
      operatorName: user.username,
      remark: body.remark,
    });
    return ResponseUtil.success(result);
  }

  @Post('unfreeze/:memberId')
  @ApiOperation({ summary: '解冻会员钱包' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '解冻成功' })
  async unfreezeWallet(
    @Param('memberId') memberId: string,
    @Body() body: { 
      amount: number;
      reason: string;
      remark?: string;
    },
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    const result = await this.walletService.changeFrozenBalance({
      memberId,
      type: 2, // 解冻
      amount: body.amount,
      businessType: 'MANUAL_UNFREEZE',
      description: `管理员解冻：${body.reason}`,
      operatorId: user.id,
      operatorName: user.username,
      remark: body.remark,
    });
    return ResponseUtil.success(result);
  }

  @Post('adjust/:memberId')
  @ApiOperation({ summary: '调整会员余额' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '调整成功' })
  async adjustBalance(
    @Param('memberId') memberId: string,
    @Body() body: {
      type: number;
      direction: number;
      amount: number;
      reason: string;
      remark?: string;
    },
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    const result = await this.walletService.changeBalance({
      memberId,
      type: body.type,
      direction: body.direction,
      amount: body.amount,
      businessType: 'MANUAL_ADJUST',
      description: `管理员调整：${body.reason}`,
      operatorId: user.id,
      operatorName: user.username,
      remark: body.remark,
    });
    return ResponseUtil.success(result);
  }

  // 充值管理
  @Get('recharge/list')
  @ApiOperation({ summary: '获取充值记录' })
  @ApiQuery({ name: 'memberId', description: '会员ID', required: false })
  @ApiQuery({ name: 'rechargeType', description: '充值方式', required: false })
  @ApiQuery({ name: 'payStatus', description: '支付状态', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRechargeList(@Query() query: any): Promise<Response<any>> {
    const result = await this.rechargeService.getRechargeList(query);
    return ResponseUtil.success(result);
  }

  @Post('recharge/handleSuccess')
  @ApiOperation({ summary: '充值成功回调处理' })
  @ApiResponse({ status: 200, description: '处理成功' })
  async handleRechargeSuccess(
    @Body() body: {
      orderNo: string;
      thirdPayNo: string;
      paymentChannel: string;
      callbackData?: string;
      actualAmount?: number;
      fee?: number;
    }
  ): Promise<Response<any>> {
    await this.rechargeService.handlePaymentSuccess(body.orderNo, body);
    return ResponseUtil.success(null);
  }

  @Post('recharge/handleFailed')
  @ApiOperation({ summary: '充值失败回调处理' })
  @ApiResponse({ status: 200, description: '处理成功' })
  async handleRechargeFailed(
    @Body() body: {
      orderNo: string;
      failReason?: string;
      callbackData?: string;
    }
  ): Promise<Response<any>> {
    await this.rechargeService.handlePaymentFailed(body.orderNo, body);
    return ResponseUtil.success(null);
  }

  @Post('recharge/account/:orderNo')
  @ApiOperation({ summary: '充值到账' })
  @ApiParam({ name: 'orderNo', description: '充值订单号' })
  @ApiResponse({ status: 200, description: '到账成功' })
  async accountRecharge(
    @Param('orderNo') orderNo: string,
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    await this.rechargeService.accountToWallet(orderNo);
    return ResponseUtil.success(null);
  }

  @Get('recharge/statistics')
  @ApiOperation({ summary: '获取充值统计' })
  @ApiQuery({ name: 'memberId', description: '会员ID', required: false })
  @ApiQuery({ name: 'rechargeType', description: '充值方式', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRechargeStatistics(@Query() query: any): Promise<Response<any>> {
    const result = await this.rechargeService.getRechargeStatistics(query);
    return ResponseUtil.success(result);
  }

  // 提现管理
  @Get('withdraw/list')
  @ApiOperation({ summary: '获取提现申请' })
  @ApiQuery({ name: 'memberId', description: '会员ID', required: false })
  @ApiQuery({ name: 'withdrawType', description: '提现方式', required: false })
  @ApiQuery({ name: 'auditStatus', description: '审核状态', required: false })
  @ApiQuery({ name: 'processStatus', description: '处理状态', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWithdrawList(@Query() query: any): Promise<Response<any>> {
    const result = await this.withdrawService.getWithdrawList(query);
    return ResponseUtil.success(result);
  }

  @Get('withdraw/detail/:withdrawNo')
  @ApiOperation({ summary: '获取提现申请详情' })
  @ApiParam({ name: 'withdrawNo', description: '提现单号' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWithdrawDetail(@Param('withdrawNo') withdrawNo: string): Promise<Response<any>> {
    const result = await this.withdrawService.getWithdrawDetail(withdrawNo);
    return ResponseUtil.success(result);
  }

  @Post('withdraw/audit/:withdrawNo')
  @ApiOperation({ summary: '审核提现申请' })
  @ApiParam({ name: 'withdrawNo', description: '提现单号' })
  @ApiResponse({ status: 200, description: '审核成功' })
  async auditWithdraw(
    @Param('withdrawNo') withdrawNo: string,
    @Body() body: {
      auditStatus: number;
      auditRemark?: string;
      rejectReason?: string;
    },
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    await this.withdrawService.auditWithdraw(withdrawNo, {
      auditStatus: body.auditStatus,
      auditorId: user.id,
      auditorName: user.username,
      auditRemark: body.auditRemark,
      rejectReason: body.rejectReason,
    });
    return ResponseUtil.success(null);
  }

  @Post('withdraw/process/:withdrawNo')
  @ApiOperation({ summary: '处理提现打款' })
  @ApiParam({ name: 'withdrawNo', description: '提现单号' })
  @ApiResponse({ status: 200, description: '处理成功' })
  async processWithdraw(
    @Param('withdrawNo') withdrawNo: string,
    @Body() body: {
      paymentChannel: string;
      thirdTradeNo?: string;
    }
  ): Promise<Response<any>> {
    await this.withdrawService.processWithdraw(withdrawNo, body);
    return ResponseUtil.success(null);
  }

  @Post('withdraw/failed/:withdrawNo')
  @ApiOperation({ summary: '处理提现失败' })
  @ApiParam({ name: 'withdrawNo', description: '提现单号' })
  @ApiResponse({ status: 200, description: '处理成功' })
  async handleWithdrawFailed(
    @Param('withdrawNo') withdrawNo: string,
    @Body() body: { failReason: string }
  ): Promise<Response<any>> {
    await this.withdrawService.handleWithdrawFailed(withdrawNo, body.failReason);
    return ResponseUtil.success(null);
  }

  @Get('withdraw/statistics')
  @ApiOperation({ summary: '获取提现统计' })
  @ApiQuery({ name: 'memberId', description: '会员ID', required: false })
  @ApiQuery({ name: 'withdrawType', description: '提现方式', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWithdrawStatistics(@Query() query: any): Promise<Response<any>> {
    const result = await this.withdrawService.getWithdrawStatistics(query);
    return ResponseUtil.success(result);
  }

  // 积分管理
  @Get('points/overview')
  @ApiOperation({ summary: '积分总览' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPointsOverview(): Promise<Response<any>> {
    const result = await this.pointsService.getPointsStatistics();
    return ResponseUtil.success(result);
  }

  @Get('points/records')
  @ApiOperation({ summary: '获取积分流水记录' })
  @ApiQuery({ name: 'memberId', description: '会员ID', required: false })
  @ApiQuery({ name: 'type', description: '变动类型', required: false })
  @ApiQuery({ name: 'direction', description: '变动方向', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPointsRecords(@Query() query: any): Promise<Response<any>> {
    const result = await this.pointsService.getPointsRecords(query);
    return ResponseUtil.success(result);
  }

  @Post('points/adjust/:memberId')
  @ApiOperation({ summary: '调整会员积分' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '调整成功' })
  async adjustPoints(
    @Param('memberId') memberId: string,
    @Body() body: {
      type: number;
      direction: number;
      points: number;
      reason: string;
      remark?: string;
    },
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    const result = await this.pointsService.changePoints({
      memberId,
      type: body.type,
      direction: body.direction,
      points: body.points,
      businessType: 'MANUAL_ADJUST',
      description: `管理员调整：${body.reason}`,
      operatorId: user.id,
      operatorName: user.username,
      remark: body.remark,
    });
    return ResponseUtil.success(result);
  }

  // 积分商品管理
  @Post('points/goods/create')
  @ApiOperation({ summary: '创建积分商品' })
  @ApiResponse({ status: 200, description: '创建成功' })
  async createPointsGoods(
    @Body() body: any,
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    const result = await this.pointsService.createPointsGoods({
      ...body,
      createBy: user.id,
    });
    return ResponseUtil.success(result);
  }

  @Get('points/goods/list')
  @ApiOperation({ summary: '获取积分商品列表' })
  @ApiQuery({ name: 'status', description: '商品状态', required: false })
  @ApiQuery({ name: 'isHot', description: '是否热门', required: false })
  @ApiQuery({ name: 'isRecommend', description: '是否推荐', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPointsGoodsList(@Query() query: any): Promise<Response<any>> {
    const result = await this.pointsService.getPointsGoodsList(query);
    return ResponseUtil.success(result);
  }

  @Get('points/goods/:id')
  @ApiOperation({ summary: '获取积分商品详情' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPointsGoodsDetail(@Param('id') id: string): Promise<Response<any>> {
    const result = await this.pointsService.getPointsGoodsDetail(id);
    return ResponseUtil.success(result);
  }

  @Put('points/goods/:id')
  @ApiOperation({ summary: '更新积分商品' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updatePointsGoods(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    // 这里应该实现更新逻辑
    return ResponseUtil.success(null);
  }

  @Delete('points/goods/:id')
  @ApiOperation({ summary: '删除积分商品' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deletePointsGoods(@Param('id') id: string): Promise<Response<any>> {
    // 这里应该实现删除逻辑
    return ResponseUtil.success(null);
  }

  // 积分兑换管理
  @Get('points/exchange/list')
  @ApiOperation({ summary: '获取积分兑换记录' })
  @ApiQuery({ name: 'memberId', description: '会员ID', required: false })
  @ApiQuery({ name: 'status', description: '兑换状态', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPointsExchangeList(@Query() query: any): Promise<Response<any>> {
    const result = await this.pointsService.getPointsExchangeList(query);
    return ResponseUtil.success(result);
  }

  @Post('points/exchange/ship/:exchangeNo')
  @ApiOperation({ summary: '积分兑换发货' })
  @ApiParam({ name: 'exchangeNo', description: '兑换单号' })
  @ApiResponse({ status: 200, description: '发货成功' })
  async shipPointsExchange(
    @Param('exchangeNo') exchangeNo: string,
    @Body() body: {
      logisticsInfo?: any;
      remark?: string;
    }
  ): Promise<Response<any>> {
    await this.pointsService.shipExchange(exchangeNo, body);
    return ResponseUtil.success(null);
  }

  @Post('points/exchange/complete/:exchangeNo')
  @ApiOperation({ summary: '完成积分兑换' })
  @ApiParam({ name: 'exchangeNo', description: '兑换单号' })
  @ApiResponse({ status: 200, description: '完成成功' })
  async completePointsExchange(@Param('exchangeNo') exchangeNo: string): Promise<Response<any>> {
    await this.pointsService.completeExchange(exchangeNo);
    return ResponseUtil.success(null);
  }

  // 安全管理
  @Post('security/freeze/:memberId')
  @ApiOperation({ summary: '冻结可疑账户' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '冻结成功' })
  async freezeSuspiciousAccount(
    @Param('memberId') memberId: string,
    @Body() body: { reason: string },
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    await this.walletSecurityService.freezeSuspiciousAccount(memberId, body.reason, user.id);
    return ResponseUtil.success(null);
  }

  @Post('security/unfreeze/:memberId')
  @ApiOperation({ summary: '解冻账户' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '解冻成功' })
  async unfreezeAccount(
    @Param('memberId') memberId: string,
    @Body() body: { reason: string },
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    await this.walletSecurityService.unfreezeAccount(memberId, body.reason, user.id);
    return ResponseUtil.success(null);
  }

  // 统计报表
  @Get('statistics/wallet')
  @ApiOperation({ summary: '钱包统计报表' })
  @ApiQuery({ name: 'memberId', description: '会员ID', required: false })
  @ApiQuery({ name: 'type', description: '变动类型', required: false })
  @ApiQuery({ name: 'direction', description: '变动方向', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'groupBy', description: '分组方式', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWalletStatistics(@Query() query: any): Promise<Response<any>> {
    const result = await this.walletStatisticsService.getWalletRecordStatistics(query);
    return ResponseUtil.success(result);
  }

  @Get('statistics/recharge')
  @ApiOperation({ summary: '充值统计报表' })
  @ApiQuery({ name: 'rechargeType', description: '充值方式', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'groupBy', description: '分组方式', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRechargeStatistics(@Query() query: any): Promise<Response<any>> {
    const result = await this.walletStatisticsService.getRechargeStatistics(query);
    return ResponseUtil.success(result);
  }

  @Get('statistics/withdraw')
  @ApiOperation({ summary: '提现统计报表' })
  @ApiQuery({ name: 'withdrawType', description: '提现方式', required: false })
  @ApiQuery({ name: 'auditStatus', description: '审核状态', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'groupBy', description: '分组方式', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWithdrawStatistics(@Query() query: any): Promise<Response<any>> {
    const result = await this.walletStatisticsService.getWithdrawStatistics(query);
    return ResponseUtil.success(result);
  }

  @Get('statistics/points')
  @ApiOperation({ summary: '积分统计报表' })
  @ApiQuery({ name: 'memberId', description: '会员ID', required: false })
  @ApiQuery({ name: 'type', description: '变动类型', required: false })
  @ApiQuery({ name: 'direction', description: '变动方向', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'groupBy', description: '分组方式', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPointsStatistics(@Query() query: any): Promise<Response<any>> {
    const result = await this.walletStatisticsService.getPointsStatistics(query);
    return ResponseUtil.success(result);
  }

  @Get('statistics/reconcile')
  @ApiOperation({ summary: '账务对账' })
  @ApiQuery({ name: 'startDate', description: '开始日期', required: true })
  @ApiQuery({ name: 'endDate', description: '结束日期', required: true })
  @ApiResponse({ status: 200, description: '对账成功' })
  async reconcileAccounts(@Query() query: { startDate: string; endDate: string }): Promise<Response<any>> {
    const result = await this.walletStatisticsService.reconcileAccounts({
      startDate: new Date(query.startDate),
      endDate: new Date(query.endDate),
    });
    return ResponseUtil.success(result);
  }

  @Post('statistics/export')
  @ApiOperation({ summary: '导出统计报表' })
  @ApiResponse({ status: 200, description: '导出成功' })
  async exportStatisticsReport(
    @Body() body: {
      reportType: 'wallet' | 'recharge' | 'withdraw' | 'points';
      format: 'excel' | 'csv';
      startTime: string;
      endTime: string;
      filters?: any;
    }
  ): Promise<Response<any>> {
    const filePath = await this.walletStatisticsService.exportStatisticsReport({
      ...body,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
    });
    return ResponseUtil.success({ filePath });
  }
}