import { Controller, Get, Post, Put, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { WalletService } from '../../common/wallet/services/wallet.service';
import { RechargeService } from '../../common/wallet/services/recharge.service';
import { WithdrawService } from '../../common/wallet/services/withdraw.service';
import { PointsService } from '../../common/wallet/services/points.service';
import { ResponseUtil } from '../../common/utils/response.util';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Response } from '../../common/interfaces/response.interface';

@ApiTags('买家-钱包')
@Controller('buyer/wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly rechargeService: RechargeService,
    private readonly withdrawService: WithdrawService,
    private readonly pointsService: PointsService,
  ) {}

  @Get('info')
  @ApiOperation({ summary: '获取钱包信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWalletInfo(@CurrentUser() user: any): Promise<Response<any>> {
    const result = await this.walletService.getWallet(user.id);
    return ResponseUtil.success(result);
  }

  @Get('records')
  @ApiOperation({ summary: '获取钱包流水记录' })
  @ApiQuery({ name: 'type', description: '变动类型', required: false })
  @ApiQuery({ name: 'direction', description: '变动方向', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWalletRecords(
    @Query() query: any,
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    const result = await this.walletService.getWalletRecords({
      memberId: user.id,
      ...query,
    });
    return ResponseUtil.success(result);
  }

  @Post('transfer')
  @ApiOperation({ summary: '钱包转账' })
  @ApiResponse({ status: 200, description: '转账成功' })
  async transfer(
    @Body() body: {
      toMemberId: string;
      amount: number;
      description?: string;
      payPassword?: string;
      remark?: string;
    },
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    const result = await this.walletService.transfer({
      fromMemberId: user.id,
      ...body,
    });
    return ResponseUtil.success(result);
  }

  @Post('setPayPassword')
  @ApiOperation({ summary: '设置支付密码' })
  @ApiResponse({ status: 200, description: '设置成功' })
  async setPayPassword(
    @Body() body: { password: string },
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    await this.walletService.setPayPassword(user.id, body.password);
    return ResponseUtil.success(null);
  }

  @Post('changePayPassword')
  @ApiOperation({ summary: '修改支付密码' })
  @ApiResponse({ status: 200, description: '修改成功' })
  async changePayPassword(
    @Body() body: { oldPassword: string; newPassword: string },
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    await this.walletService.changePayPassword(user.id, body.oldPassword, body.newPassword);
    return ResponseUtil.success(null);
  }

  @Post('resetPayPassword')
  @ApiOperation({ summary: '重置支付密码' })
  @ApiResponse({ status: 200, description: '重置成功' })
  async resetPayPassword(
    @Body() body: { newPassword: string; verifyCode: string },
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    await this.walletService.resetPayPassword(user.id, body.newPassword, body.verifyCode);
    return ResponseUtil.success(null);
  }

  @Post('recharge/create')
  @ApiOperation({ summary: '创建充值订单' })
  @ApiResponse({ status: 200, description: '创建成功' })
  async createRecharge(
    @Body() body: {
      amount: number;
      rechargeType: number;
      returnUrl?: string;
      notifyUrl?: string;
      remark?: string;
    },
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    const result = await this.rechargeService.createRecharge({
      memberId: user.id,
      memberName: user.nickname || user.mobile,
      ...body,
    });
    return ResponseUtil.success(result);
  }

  @Get('recharge/detail/:orderNo')
  @ApiOperation({ summary: '获取充值订单详情' })
  @ApiParam({ name: 'orderNo', description: '充值订单号' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRechargeDetail(@Param('orderNo') orderNo: string): Promise<Response<any>> {
    const result = await this.rechargeService.getRechargeDetail(orderNo);
    return ResponseUtil.success(result);
  }

  @Get('recharge/list')
  @ApiOperation({ summary: '获取充值记录' })
  @ApiQuery({ name: 'rechargeType', description: '充值方式', required: false })
  @ApiQuery({ name: 'payStatus', description: '支付状态', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRechargeList(
    @Query() query: any,
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    const result = await this.rechargeService.getRechargeList({
      memberId: user.id,
      ...query,
    });
    return ResponseUtil.success(result);
  }

  @Post('recharge/cancel/:orderNo')
  @ApiOperation({ summary: '取消充值订单' })
  @ApiParam({ name: 'orderNo', description: '充值订单号' })
  @ApiResponse({ status: 200, description: '取消成功' })
  async cancelRecharge(
    @Param('orderNo') orderNo: string,
    @Body() body: { reason?: string },
  ): Promise<Response<any>> {
    await this.rechargeService.cancelRecharge(orderNo, body.reason);
    return ResponseUtil.success(null);
  }

  @Post('withdraw/create')
  @ApiOperation({ summary: '创建提现申请' })
  @ApiResponse({ status: 200, description: '创建成功' })
  async createWithdraw(
    @Body() body: {
      amount: number;
      withdrawType: number;
      bankAccountId?: string;
      bankAccountNo?: string;
      accountName?: string;
      bankName?: string;
      alipayAccount?: string;
      alipayName?: string;
      wechatAccount?: string;
      wechatName?: string;
      payPassword?: string;
      remark?: string;
    },
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    const result = await this.withdrawService.createWithdraw({
      memberId: user.id,
      memberName: user.nickname || user.mobile,
      ...body,
    });
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

  @Get('withdraw/list')
  @ApiOperation({ summary: '获取提现记录' })
  @ApiQuery({ name: 'withdrawType', description: '提现方式', required: false })
  @ApiQuery({ name: 'auditStatus', description: '审核状态', required: false })
  @ApiQuery({ name: 'processStatus', description: '处理状态', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getWithdrawList(
    @Query() query: any,
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    const result = await this.withdrawService.getWithdrawList({
      memberId: user.id,
      ...query,
    });
    return ResponseUtil.success(result);
  }

  @Get('points/info')
  @ApiOperation({ summary: '获取积分信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPointsInfo(@CurrentUser() user: any): Promise<Response<any>> {
    const result = await this.pointsService.getMemberPoints(user.id);
    return ResponseUtil.success(result);
  }

  @Get('points/records')
  @ApiOperation({ summary: '获取积分流水记录' })
  @ApiQuery({ name: 'type', description: '变动类型', required: false })
  @ApiQuery({ name: 'direction', description: '变动方向', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPointsRecords(
    @Query() query: any,
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    const result = await this.pointsService.getPointsRecords({
      memberId: user.id,
      ...query,
    });
    return ResponseUtil.success(result);
  }

  @Get('points/goods')
  @ApiOperation({ summary: '获取积分商品列表' })
  @ApiQuery({ name: 'status', description: '商品状态', required: false })
  @ApiQuery({ name: 'isHot', description: '是否热门', required: false })
  @ApiQuery({ name: 'isRecommend', description: '是否推荐', required: false })
  @ApiQuery({ name: 'pointsMin', description: '最小积分', required: false })
  @ApiQuery({ name: 'pointsMax', description: '最大积分', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPointsGoods(@Query() query: any): Promise<Response<any>> {
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

  @Post('points/exchange')
  @ApiOperation({ summary: '积分兑换商品' })
  @ApiResponse({ status: 200, description: '兑换成功' })
  async exchangePointsGoods(
    @Body() body: {
      pointsGoodsId: string;
      quantity?: number;
      shippingInfo?: any;
      remark?: string;
    },
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    const result = await this.pointsService.exchangePointsGoods({
      memberId: user.id,
      memberName: user.nickname || user.mobile,
      ...body,
    });
    return ResponseUtil.success(result);
  }

  @Get('points/exchange/list')
  @ApiOperation({ summary: '获取兑换记录' })
  @ApiQuery({ name: 'status', description: '兑换状态', required: false })
  @ApiQuery({ name: 'startTime', description: '开始时间', required: false })
  @ApiQuery({ name: 'endTime', description: '结束时间', required: false })
  @ApiQuery({ name: 'page', description: '页码', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, example: 10 })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPointsExchangeList(
    @Query() query: any,
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    const result = await this.pointsService.getPointsExchangeList({
      memberId: user.id,
      ...query,
    });
    return ResponseUtil.success(result);
  }

  @Get('points/exchange/:exchangeNo')
  @ApiOperation({ summary: '获取兑换详情' })
  @ApiParam({ name: 'exchangeNo', description: '兑换单号' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPointsExchangeDetail(@Param('exchangeNo') exchangeNo: string): Promise<Response<any>> {
    // 这里应该调用pointsService的方法获取详情
    // 简化实现
    return ResponseUtil.success({});
  }

  @Post('points/exchange/cancel/:exchangeNo')
  @ApiOperation({ summary: '取消积分兑换' })
  @ApiParam({ name: 'exchangeNo', description: '兑换单号' })
  @ApiResponse({ status: 200, description: '取消成功' })
  async cancelPointsExchange(
    @Param('exchangeNo') exchangeNo: string,
    @Body() body: { reason?: string },
    @CurrentUser() user: any,
  ): Promise<Response<any>> {
    await this.pointsService.cancelExchange(exchangeNo, body.reason);
    return ResponseUtil.success(null);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取我的钱包统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMyWalletStatistics(@CurrentUser() user: any): Promise<Response<any>> {
    const result = await this.walletService.getWalletStatistics(user.id);
    return ResponseUtil.success(result);
  }
}