import { Controller, Post, Get, Body, Param, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { ApiResponseDto } from '../../../common/dto/api-response.dto';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentCallbackDto } from '../dto/payment-callback.dto';
import { QueryPaymentDto } from '../dto/query-payment.dto';

@ApiTags('支付管理')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({ summary: '创建支付订单' })
  @ApiResponse({ status: HttpStatus.OK, description: '支付订单创建成功' })
  @Post('create')
  async createPayment(@Body() createPaymentDto: CreatePaymentDto): Promise<ApiResponseDto> {
    const result = await this.paymentService.createPayment(createPaymentDto);
    return ApiResponseDto.success(result, '支付订单创建成功');
  }

  @ApiOperation({ summary: '支付接口' })
  @ApiResponse({ status: HttpStatus.OK, description: '支付接口调用成功' })
  @Get('pay/:paymentMethod/:paymentClient')
  async payment(
    @Param('paymentMethod') paymentMethod: string,
    @Param('paymentClient') paymentClient: string,
    @Query() queryPaymentDto: QueryPaymentDto,
  ): Promise<ApiResponseDto> {
    const result = await this.paymentService.payment(paymentMethod, paymentClient, queryPaymentDto);
    return ApiResponseDto.success(result, '支付接口调用成功');
  }

  @ApiOperation({ summary: '支付回调' })
  @ApiResponse({ status: HttpStatus.OK, description: '支付回调处理成功' })
  @Post('callback/:paymentMethod')
  async paymentCallback(
    @Param('paymentMethod') paymentMethod: string,
    @Body() paymentCallbackDto: PaymentCallbackDto,
  ): Promise<string> {
    await this.paymentService.paymentCallback(paymentMethod, paymentCallbackDto);
    return this.paymentService.getCallbackResponse(paymentMethod);
  }

  @ApiOperation({ summary: '查询支付状态' })
  @ApiResponse({ status: HttpStatus.OK, description: '支付状态查询成功' })
  @Get('query/:outTradeNo')
  async queryPayment(@Param('outTradeNo') outTradeNo: string): Promise<ApiResponseDto> {
    const result = await this.paymentService.queryPayment(outTradeNo);
    return ApiResponseDto.success(result, '支付状态查询成功');
  }

  @ApiOperation({ summary: '关闭支付订单' })
  @ApiResponse({ status: HttpStatus.OK, description: '支付订单关闭成功' })
  @Post('close/:outTradeNo')
  async closePayment(@Param('outTradeNo') outTradeNo: string): Promise<ApiResponseDto> {
    await this.paymentService.closePayment(outTradeNo);
    return ApiResponseDto.success(null, '支付订单关闭成功');
  }

  @ApiOperation({ summary: '获取支付方式列表' })
  @ApiResponse({ status: HttpStatus.OK, description: '支付方式列表获取成功' })
  @Get('methods')
  async getPaymentMethods(): Promise<ApiResponseDto> {
    const result = await this.paymentService.getPaymentMethods();
    return ApiResponseDto.success(result, '支付方式列表获取成功');
  }
}
