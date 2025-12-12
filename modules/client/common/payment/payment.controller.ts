import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PayStatus } from './enum/payment-status.enum';

@ApiTags('支付管理')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: '创建支付订单' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return await this.paymentService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: '查询所有支付订单' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll() {
    return await this.paymentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID查询支付订单' })
  @ApiParam({ name: 'id', description: '支付订单ID' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findOne(@Param('id') id: string) {
    return await this.paymentService.findOne(id);
  }

  @Get('paySn/:paySn')
  @ApiOperation({ summary: '根据支付单号查询支付订单' })
  @ApiParam({ name: 'paySn', description: '支付单号' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findByPaySn(@Param('paySn') paySn: string) {
    return await this.paymentService.findByPaySn(paySn);
  }

  @Get('orderSn/:orderSn')
  @ApiOperation({ summary: '根据订单编号查询支付订单' })
  @ApiParam({ name: 'orderSn', description: '订单编号' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findByOrderSn(@Param('orderSn') orderSn: string) {
    return await this.paymentService.findByOrderSn(orderSn);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新支付订单' })
  @ApiParam({ name: 'id', description: '支付订单ID' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return await this.paymentService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除支付订单' })
  @ApiParam({ name: 'id', description: '支付订单ID' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async remove(@Param('id') id: string) {
    return await this.paymentService.remove(id);
  }

  @Post('callback/:paySn')
  @ApiOperation({ summary: '处理支付回调' })
  @ApiParam({ name: 'paySn', description: '支付单号' })
  async handleCallback(
    @Param('paySn') paySn: string,
    @Body('status') status: PayStatus,
    @Body('transactionId') transactionId: string,
    @Body('callbackData') callbackData: string,
  ) {
    return await this.paymentService.handleCallback(paySn, status, transactionId, callbackData);
  }

  @Post('refund')
  @ApiOperation({ summary: '发起退款' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async refund(@Body() refundPaymentDto: RefundPaymentDto) {
    return await this.paymentService.refund(refundPaymentDto);
  }
}
