import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { RechargeDto } from './dto/recharge.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@ApiTags('钱包管理')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @ApiOperation({ summary: '获取用户钱包信息' })
  @ApiResponse({ status: 200, description: '获取钱包信息成功' })
  @ApiResponse({ status: 404, description: '钱包不存在' })
  @Get('user/:userId')
  getWallet(@Param('userId') userId: string): { success: boolean; data: Wallet | null } {
    const wallet = this.walletService.getWalletByUserId(userId);
    return { success: true, data: wallet };
  }

  @ApiOperation({ summary: '充值' })
  @ApiResponse({ status: 200, description: '充值成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @Post(':userId/recharge')
  recharge(@Param('userId') userId: string, @Body() dto: RechargeDto): { success: boolean; data: WalletTransaction } {
    const result = this.walletService.recharge(userId, dto);
    return { success: result.success, data: result.transaction };
  }

  @ApiOperation({ summary: '提现' })
  @ApiResponse({ status: 200, description: '提现成功' })
  @ApiResponse({ status: 400, description: '请求参数错误或余额不足' })
  @ApiResponse({ status: 404, description: '钱包不存在' })
  @Post(':userId/withdraw')
  withdraw(@Param('userId') userId: string, @Body() dto: WithdrawDto): { success: boolean; data: WalletTransaction } {
    try {
      const result = this.walletService.withdraw(userId, dto);
      return { success: result.success, data: result.transaction };
    } catch (error) {
      return { success: false, data: null };
    }
  }

  @ApiOperation({ summary: '支付订单' })
  @ApiResponse({ status: 200, description: '支付成功' })
  @ApiResponse({ status: 400, description: '余额不足' })
  @ApiResponse({ status: 404, description: '钱包不存在' })
  @Post(':userId/pay-order')
  payOrder(@Param('userId') userId: string, @Body() body: { amount: number; orderId: string }): { success: boolean; data: WalletTransaction } {
    try {
      const result = this.walletService.payOrder(userId, body.amount, body.orderId);
      return { success: result.success, data: result.transaction };
    } catch (error) {
      return { success: false, data: null };
    }
  }

  @ApiOperation({ summary: '订单退款' })
  @ApiResponse({ status: 200, description: '退款成功' })
  @ApiResponse({ status: 404, description: '钱包不存在' })
  @Post(':userId/refund-order')
  refundOrder(@Param('userId') userId: string, @Body() body: { amount: number; orderId: string }): { success: boolean; data: WalletTransaction } {
    try {
      const result = this.walletService.refundOrder(userId, body.amount, body.orderId);
      return { success: result.success, data: result.transaction };
    } catch (error) {
      return { success: false, data: null };
    }
  }

  @ApiOperation({ summary: '获取交易记录' })
  @ApiResponse({ status: 200, description: '获取交易记录成功' })
  @ApiQuery({ name: 'page', required: false, type: Number, default: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, default: 10 })
  @Get(':userId/transactions')
  getTransactions(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10
  ): { success: boolean; data: WalletTransaction[] } {
    const transactions = this.walletService.getTransactions(userId, page, pageSize);
    return { success: true, data: transactions };
  }
}
