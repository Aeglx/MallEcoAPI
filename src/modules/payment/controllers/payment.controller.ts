import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { PaymentEntity } from '../entities/payment.entity';

@ApiTags('支付管理')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('order/:orderSn')
  @ApiOperation({ summary: '创建订单支付' })
  @ApiParam({ name: 'orderSn', description: '订单号' })
  @ApiResponse({ status: 201, description: '支付创建成功', type: PaymentEntity })
  async createOrderPayment(
    @Param('orderSn') orderSn: string,
    @Body() data: {
      paymentMethod: string;
      paymentAmount: number;
      memberId: string;
      returnUrl?: string;
    }
  ) {
    return await this.paymentService.createOrderPayment(orderSn, data);
  }

  @Post('recharge/:rechargeSn')
  @ApiOperation({ summary: '创建充值支付' })
  @ApiParam({ name: 'rechargeSn', description: '充值号' })
  @ApiResponse({ status: 201, description: '支付创建成功', type: PaymentEntity })
  async createRechargePayment(
    @Param('rechargeSn') rechargeSn: string,
    @Body() data: {
      paymentMethod: string;
      paymentAmount: number;
      memberId: string;
      returnUrl?: string;
    }
  ) {
    return await this.paymentService.createRechargePayment(rechargeSn, data);
  }

  @Get('methods')
  @ApiOperation({ summary: '获取可用支付方式' })
  async getPaymentMethods() {
    return await this.paymentService.getPaymentMethods();
  }

  @Get('order/:orderSn')
  @ApiOperation({ summary: '获取订单支付信息' })
  @ApiParam({ name: 'orderSn', description: '订单号' })
  @ApiResponse({ status: 200, description: '获取成功', type: PaymentEntity })
  async getOrderPayment(@Param('orderSn') orderSn: string) {
    return await this.paymentService.getOrderPayment(orderSn);
  }

  @Post('callback/:paymentSn')
  @ApiOperation({ summary: '支付回调处理' })
  @ApiParam({ name: 'paymentSn', description: '支付单号' })
  @ApiResponse({ status: 200, description: '回调处理成功' })
  async paymentCallback(
    @Param('paymentSn') paymentSn: string,
    @Body() callbackData: any
  ) {
    return await this.paymentService.paymentCallback(paymentSn, callbackData);
  }

  @Post('refund/:paymentSn')
  @ApiOperation({ summary: '申请退款' })
  @ApiParam({ name: 'paymentSn', description: '支付单号' })
  @ApiResponse({ status: 200, description: '退款申请成功' })
  async applyRefund(
    @Param('paymentSn') paymentSn: string,
    @Body() data: {
      refundAmount: number;
      refundReason: string;
      operatorId: string;
    }
  ) {
    return await this.paymentService.applyRefund(paymentSn, data);
  }

  @Get('refunds')
  @ApiOperation({ summary: '获取退款记录列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'status', required: false, description: '退款状态' })
  async getRefundRecords(@Query() params: {
    page?: number;
    pageSize?: number;
    status?: string;
  }) {
    return await this.paymentService.getRefundRecords(params);
  }

  @Post('refund/:refundId/approve')
  @ApiOperation({ summary: '审核通过退款' })
  @ApiParam({ name: 'refundId', description: '退款申请ID' })
  @ApiResponse({ status: 200, description: '审核通过' })
  async approveRefund(
    @Param('refundId') refundId: string,
    @Body() data: {
      approveRemark?: string;
      operatorId: string;
    }
  ) {
    return await this.paymentService.approveRefund(refundId, data);
  }

  @Post('refund/:refundId/reject')
  @ApiOperation({ summary: '拒绝退款' })
  @ApiParam({ name: 'refundId', description: '退款申请ID' })
  @ApiResponse({ status: 200, description: '拒绝成功' })
  async rejectRefund(
    @Param('refundId') refundId: string,
    @Body() data: {
      rejectReason: string;
      operatorId: string;
    }
  ) {
    return await this.paymentService.rejectRefund(refundId, data);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取支付统计' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期' })
  @ApiQuery({ name: 'paymentMethod', required: false, description: '支付方式' })
  async getPaymentStatistics(@Query() params: {
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
  }) {
    return await this.paymentService.getPaymentStatistics(params);
  }

  @Post('wechat/native')
  @ApiOperation({ summary: '微信Native支付' })
  @ApiResponse({ status: 200, description: '微信支付创建成功' })
  async wechatNativePayment(@Body() data: {
    orderSn: string;
    totalFee: number;
    body: string;
    notifyUrl: string;
  }) {
    return await this.paymentService.wechatNativePayment(data);
  }

  @Post('wechat/jsapi')
  @ApiOperation({ summary: '微信JSAPI支付' })
  @ApiResponse({ status: 200, description: '微信JSAPI支付创建成功' })
  async wechatJsapiPayment(@Body() data: {
    orderSn: string;
    totalFee: number;
    body: string;
    openid: string;
    notifyUrl: string;
  }) {
    return await this.paymentService.wechatJsapiPayment(data);
  }

  @Post('alipay/page')
  @ApiOperation({ summary: '支付宝网页支付' })
  @ApiResponse({ status: 200, description: '支付宝支付创建成功' })
  async alipayPagePayment(@Body() data: {
    orderSn: string;
    totalAmount: number;
    subject: string;
    returnUrl: string;
    notifyUrl: string;
  }) {
    return await this.paymentService.alipayPagePayment(data);
  }

  @Post('alipay/app')
  @ApiOperation({ summary: '支付宝App支付' })
  @ApiResponse({ status: 200, description: '支付宝App支付创建成功' })
  async alipayAppPayment(@Body() data: {
    orderSn: string;
    totalAmount: number;
    subject: string;
    notifyUrl: string;
  }) {
    return await this.paymentService.alipayAppPayment(data);
  }

  @Get('wechat/query/:transactionId')
  @ApiOperation({ summary: '查询微信支付订单' })
  @ApiParam({ name: 'transactionId', description: '微信交易号' })
  async queryWechatPayment(@Param('transactionId') transactionId: string) {
    return await this.paymentService.queryWechatPayment(transactionId);
  }

  @Get('alipay/query/:tradeNo')
  @ApiOperation({ summary: '查询支付宝支付订单' })
  @ApiParam({ name: 'tradeNo', description: '支付宝交易号' })
  async queryAlipayPayment(@Param('tradeNo') tradeNo: string) {
    return await this.paymentService.queryAlipayPayment(tradeNo);
  }
}