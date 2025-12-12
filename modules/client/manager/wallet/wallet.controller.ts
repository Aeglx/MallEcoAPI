import { Controller, Get, Post, Put, Query, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard';
import { WalletService } from '../../common/wallet/services/wallet.service';
import { RechargeService } from '../../common/wallet/services/recharge.service';
import { WithdrawService } from '../../common/wallet/services/withdraw.service';
import { PointsService } from '../../common/wallet/services/points.service';
import { WalletSecurityService } from '../../common/wallet/services/wallet-security.service';
import { WalletStatisticsService } from '../../common/wallet/services/wallet-statistics.service';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator';
import { ResponseModel } from '../../common/interfaces/response.interface';

@ApiTags('管理-钱包')
@Controller('manager/wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
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
  @ApiOperation({ summary: '获取钱包总览' })
  @ApiQuery({ name: 'startDate', description: '开始时间', required: false })
  @ApiQuery({ name: 'endDate', description: '结束时间', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWalletOverview(@Query() query: any): Promise<ResponseModel<any>> {
    const result = await this.walletStatisticsService.getWalletOverview(query);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Get('records')
  @ApiOperation({ summary: '获取钱包流水' })
  @ApiQuery({ name: 'memberId', description: '会员ID', required: false })
  @ApiQuery({ name: 'type', description: '变动类型', required: false })
  @ApiQuery({ name: 'direction', description: '变动方向', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWalletRecords(@Query() query: any): Promise<ResponseModel<any>> {
    // 暂时返回空数据，后续实现
    return {
      code: 200,
      message: '获取成功',
      data: [],
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Post('freeze')
  @ApiOperation({ summary: '冻结钱包' })
  @ApiBody({ description: '冻结钱包参数', type: Object })
  @ApiResponse({ status: 200, description: '冻结成功' })
  async freezeWallet(
    @Body() body: {
      memberId: string;
      reason: string;
    },
    @CurrentUser() user: any,
  ): Promise<ResponseModel<any>> {
    await this.walletSecurityService.freezeSuspiciousAccount(
      body.memberId,
      body.reason,
      user.id
    );
    return {
      code: 200,
      message: '冻结成功',
      data: {},
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Post('unfreeze')
  @ApiOperation({ summary: '解冻钱包' })
  @ApiBody({ description: '解冻钱包参数', type: Object })
  @ApiResponse({ status: 200, description: '解冻成功' })
  async unfreezeWallet(
    @Body() body: {
      memberId: string;
      reason: string;
    },
    @CurrentUser() user: any,
  ): Promise<ResponseModel<any>> {
    await this.walletSecurityService.unfreezeAccount(
      body.memberId,
      body.reason,
      user.id
    );
    return {
      code: 200,
      message: '解冻成功',
      data: {},
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Post('adjust')
  @ApiOperation({ summary: '手动调整钱包余额' })
  @ApiBody({ description: '调整钱包参数', type: Object })
  @ApiResponse({ status: 200, description: '调整成功' })
  async adjustWalletBalance(
    @Body() body: {
      memberId: string;
      amount: number;
      type: string;
      reason: string;
    },
    @CurrentUser() user: any,
  ): Promise<ResponseModel<any>> {
    const result = await this.walletService.changeBalance({
      memberId: body.memberId,
      type: body.type === 'increase' ? 1 : 2, // 1-收入, 2-支出
      direction: body.type === 'increase' ? 1 : 2, // 1-收入, 2-支出
      amount: Math.abs(body.amount),
      businessType: 'manual_adjust',
      description: body.reason,
      operatorId: user.id,
      operatorName: user.username,
    });
    return {
      code: 200,
      message: '调整成功',
      data: result,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Get('recharge/list')
  @ApiOperation({ summary: '获取充值列表' })
  @ApiQuery({ name: 'memberId', description: '会员ID', required: false })
  @ApiQuery({ name: 'rechargeType', description: '充值方式', required: false })
  @ApiQuery({ name: 'status', description: '充值状态', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRechargeList(@Query() query: any): Promise<ResponseModel<any>> {
    const result = await this.rechargeService.getRechargeList(query);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Post('recharge/verify')
  @ApiOperation({ summary: '手动审核充值' })
  @ApiBody({ description: '审核充值参数', type: Object })
  @ApiResponse({ status: 200, description: '审核成功' })
  async verifyRecharge(
    @Body() body: {
      rechargeNo: string;
      status: string;
      remark?: string;
    },
    @CurrentUser() user: any,
  ): Promise<ResponseModel<any>> {
    await this.rechargeService.verifyRecharge(
      body.rechargeNo,
      body.status,
      body.remark,
      user.id,
      user.username,
    );
    return {
      code: 200,
      message: '审核成功',
      data: null,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Post('recharge/sync')
  @ApiOperation({ summary: '同步充值状态' })
  @ApiBody({ description: '同步充值参数', type: Object })
  @ApiResponse({ status: 200, description: '同步成功' })
  async syncRechargeStatus(@Body() body: { rechargeNo: string }): Promise<ResponseModel<any>> {
    await this.rechargeService.syncRechargeStatus(body.rechargeNo);
    return {
      code: 200,
      message: '同步成功',
      data: null,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Get('recharge/statistics')
  @ApiOperation({ summary: '获取充值统计' })
  @ApiQuery({ name: 'rechargeType', description: '充值方式', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRechargeStatistics(@Query() query: any): Promise<ResponseModel<any>> {
    const result = await this.walletStatisticsService.getRechargeStatistics(query);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: ''
    };
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
  async getWithdrawList(@Query() query: any): Promise<ResponseModel<any>> {
    const result = await this.withdrawService.getWithdrawList(query);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Get('withdraw/detail/:withdrawNo')
  @ApiOperation({ summary: '获取提现申请详情' })
  @ApiParam({ name: 'withdrawNo', description: '提现单号' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWithdrawDetail(@Param('withdrawNo') withdrawNo: string): Promise<ResponseModel<any>> {
    const result = await this.withdrawService.getWithdrawDetail(withdrawNo);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Post('withdraw/audit')
  @ApiOperation({ summary: '审核提现申请' })
  @ApiBody({ description: '审核提现参数', type: Object })
  @ApiResponse({ status: 200, description: '审核成功' })
  async auditWithdraw(
    @Body() body: {
      withdrawNo: string;
      status: string;
      remark?: string;
    },
    @CurrentUser() user: any,
  ): Promise<ResponseModel<any>> {
    await this.withdrawService.auditWithdraw(
      body.withdrawNo,
      body.status,
      body.remark,
      user.id,
      user.username,
    );
    return {
      code: 200,
      message: '审核成功',
      data: null,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Post('withdraw/process')
  @ApiOperation({ summary: '处理提现申请' })
  @ApiBody({ description: '处理提现参数', type: Object })
  @ApiResponse({ status: 200, description: '处理成功' })
  async processWithdraw(
    @Body() body: {
      withdrawNo: string;
      status: string;
      remark?: string;
      transactionNo?: string;
    },
    @CurrentUser() user: any,
  ): Promise<ResponseModel<any>> {
    await this.withdrawService.processWithdraw(
      body.withdrawNo,
      body.status,
      body.remark,
      body.transactionNo,
      user.id,
      user.username,
    );
    return {
      code: 200,
      message: '处理成功',
      data: null,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Post('withdraw/failed')
  @ApiOperation({ summary: '处理提现失败' })
  @ApiBody({ description: '处理提现失败参数', type: Object })
  @ApiResponse({ status: 200, description: '处理成功' })
  async handleWithdrawFailed(
    @Body() body: {
      withdrawNo: string;
      reason: string;
    },
    @CurrentUser() user: any,
  ): Promise<ResponseModel<any>> {
    await this.withdrawService.handleWithdrawFailed(
      body.withdrawNo,
      body.reason,
      user.id,
      user.username,
    );
    return {
      code: 200,
      message: '处理成功',
      data: null,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Get('withdraw/statistics')
  @ApiOperation({ summary: '获取提现统计' })
  @ApiQuery({ name: 'withdrawType', description: '提现方式', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWithdrawStatistics(@Query() query: any): Promise<ResponseModel<any>> {
    const result = await this.walletStatisticsService.getWithdrawStatistics(query);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  // 积分管理
  @Get('points/overview')
  @ApiOperation({ summary: '获取积分总览' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPointsOverview(): Promise<ResponseModel<any>> {
    const result = await this.pointsService.getPointsOverview();
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Get('points/records')
  @ApiOperation({ summary: '获取积分记录' })
  @ApiQuery({ name: 'memberId', description: '会员ID', required: false })
  @ApiQuery({ name: 'type', description: '变动类型', required: false })
  @ApiQuery({ name: 'direction', description: '变动方向', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPointsRecords(@Query() query: any): Promise<ResponseModel<any>> {
    const result = await this.pointsService.getPointsRecords(query);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Post('points/adjust')
  @ApiOperation({ summary: '手动调整积分' })
  @ApiBody({ description: '调整积分参数', type: Object })
  @ApiResponse({ status: 200, description: '调整成功' })
  async adjustPoints(
    @Body() body: {
      memberId: string;
      amount: number;
      type: string;
      reason: string;
    },
    @CurrentUser() user: any,
  ): Promise<ResponseModel<any>> {
    const result = await this.pointsService.adjustPoints(
      body.memberId,
      body.amount,
      body.type,
      body.reason,
      user.id,
      user.username,
    );
    return {
      code: 200,
      message: '调整成功',
      data: result,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  // 积分商品管理
  @Get('points/goods/list')
  @ApiOperation({ summary: '获取积分商品列表' })
  @ApiQuery({ name: 'name', description: '商品名称', required: false })
  @ApiQuery({ name: 'status', description: '商品状态', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPointsGoodsList(@Query() query: any): Promise<ResponseModel<any>> {
    const result = await this.pointsGoodsService.getPointsGoodsList(query);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Get('points/goods/detail/:id')
  @ApiOperation({ summary: '获取积分商品详情' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPointsGoodsDetail(@Param('id') id: string): Promise<ResponseModel<any>> {
    const result = await this.pointsGoodsService.getPointsGoodsDetail(+id);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Post('points/goods/create')
  @ApiOperation({ summary: '创建积分商品' })
  @ApiBody({ description: '创建积分商品参数', type: Object })
  @ApiResponse({ status: 200, description: '创建成功' })
  async createPointsGoods(@Body() createGoodsDto: any): Promise<ResponseModel<any>> {
    await this.pointsGoodsService.createPointsGoods(createGoodsDto);
    return {
      code: 200,
      message: '创建成功',
      data: null,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Post('points/goods/update/:id')
  @ApiOperation({ summary: '更新积分商品' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiBody({ description: '更新积分商品参数', type: Object })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updatePointsGoods(
    @Param('id') id: string,
    @Body() updateGoodsDto: any,
  ): Promise<ResponseModel<any>> {
    await this.pointsGoodsService.updatePointsGoods(+id, updateGoodsDto);
    return {
      code: 200,
      message: '更新成功',
      data: null,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Post('points/goods/delete/:id')
  @ApiOperation({ summary: '删除积分商品' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deletePointsGoods(@Param('id') id: string): Promise<ResponseModel<any>> {
    await this.pointsGoodsService.deletePointsGoods(+id);
    return {
      code: 200,
      message: '删除成功',
      data: null,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  // 积分兑换管理
  @Get('points/exchange/list')
  @ApiOperation({ summary: '获取积分兑换列表' })
  @ApiQuery({ name: 'memberId', description: '会员ID', required: false })
  @ApiQuery({ name: 'goodsId', description: '商品ID', required: false })
  @ApiQuery({ name: 'status', description: '兑换状态', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPointsExchangeList(@Query() query: any): Promise<ResponseModel<any>> {
    const result = await this.pointsExchangeService.getPointsExchangeList(query);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Post('points/exchange/deliver')
  @ApiOperation({ summary: '发货积分兑换商品' })
  @ApiBody({ description: '发货参数', type: Object })
  @ApiResponse({ status: 200, description: '发货成功' })
  async deliverPointsExchange(
    @Body() body: {
      exchangeNo: string;
      logisticsCompany: string;
      logisticsNo: string;
    },
  ): Promise<ResponseModel<any>> {
    await this.pointsExchangeService.deliverPointsExchange(
      body.exchangeNo,
      body.logisticsCompany,
      body.logisticsNo,
    );
    return {
      code: 200,
      message: '发货成功',
      data: null,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Post('points/exchange/complete')
  @ApiOperation({ summary: '完成积分兑换' })
  @ApiBody({ description: '完成兑换参数', type: Object })
  @ApiResponse({ status: 200, description: '完成成功' })
  async completePointsExchange(
    @Body() body: { exchangeNo: string },
  ): Promise<ResponseModel<any>> {
    await this.pointsExchangeService.completePointsExchange(body.exchangeNo);
    return {
      code: 200,
      message: '完成成功',
      data: null,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  // 安全管理
  @Post('security/freeze')
  @ApiOperation({ summary: '冻结可疑账户' })
  @ApiBody({ description: '冻结账户参数', type: Object })
  @ApiResponse({ status: 200, description: '冻结成功' })
  async freezeSuspiciousAccount(
    @Body() body: {
      memberId: string;
      reason: string;
    },
    @CurrentUser() user: any,
  ): Promise<ResponseModel<any>> {
    await this.walletSecurityService.freezeAccount(
      body.memberId,
      body.reason,
      user.id,
      user.username,
    );
    return {
      code: 200,
      message: '冻结成功',
      data: null,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Post('security/unfreeze')
  @ApiOperation({ summary: '解冻账户' })
  @ApiBody({ description: '解冻账户参数', type: Object })
  @ApiResponse({ status: 200, description: '解冻成功' })
  async unfreezeAccount(
    @Body() body: {
      memberId: string;
      reason: string;
    },
    @CurrentUser() user: any,
  ): Promise<ResponseModel<any>> {
    await this.walletSecurityService.unfreezeAccount(
      body.memberId,
      body.reason,
      user.id,
      user.username,
    );
    return {
      code: 200,
      message: '解冻成功',
      data: null,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  // 统计报表
  @Get('statistics/wallet')
  @ApiOperation({ summary: '钱包统计报表' })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'groupBy', description: '分组方式', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWalletStatistics(@Query() query: any): Promise<ResponseModel<any>> {
    const result = await this.walletStatisticsService.getWalletStatistics(query);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Get('statistics/recharge')
  @ApiOperation({ summary: '充值统计报表' })
  @ApiQuery({ name: 'rechargeType', description: '充值方式', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'groupBy', description: '分组方式', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRechargeStatistics(@Query() query: any): Promise<ResponseModel<any>> {
    const result = await this.walletStatisticsService.getRechargeStatistics(query);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Get('statistics/withdraw')
  @ApiOperation({ summary: '提现统计报表' })
  @ApiQuery({ name: 'withdrawType', description: '提现方式', required: false })
  @ApiQuery({ name: 'auditStatus', description: '审核状态', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'groupBy', description: '分组方式', required: false })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWithdrawStatistics(@Query() query: any): Promise<ResponseModel<any>> {
    const result = await this.walletStatisticsService.getWithdrawStatistics(query);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: ''
    };
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
  async getPointsStatistics(@Query() query: any): Promise<ResponseModel<any>> {
    const result = await this.walletStatisticsService.getPointsStatistics(query);
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  // 对账功能
  @Get('reconciliation')
  @ApiOperation({ summary: '财务对账' })
  @ApiQuery({ name: 'startDate', description: '开始日期', required: true })
  @ApiQuery({ name: 'endDate', description: '结束日期', required: true })
  @ApiResponse({ status: 200, description: '获取成功' })
  async reconcileAccounts(
    @Query() query: { startDate: string; endDate: string },
  ): Promise<ResponseModel<any>> {
    const result = await this.walletStatisticsService.reconcileAccounts(
      query.startDate,
      query.endDate,
    );
    return {
      code: 200,
      message: '获取成功',
      data: result,
      timestamp: Date.now(),
      traceId: ''
    };
  }

  @Get('reconciliation/export')
  @ApiOperation({ summary: '导出对账报表' })
  @ApiQuery({ name: 'startDate', description: '开始日期', required: true })
  @ApiQuery({ name: 'endDate', description: '结束日期', required: true })
  @ApiResponse({ status: 200, description: '导出成功' })
  async exportReconciliation(
    @Query() query: { startDate: string; endDate: string },
  ): Promise<ResponseModel<any>> {
    const filePath = await this.walletStatisticsService.exportReconciliation(
      query.startDate,
      query.endDate,
    );
    return {
      code: 200,
      message: '导出成功',
      data: { filePath },
      timestamp: Date.now(),
      traceId: ''
    };
  }
}