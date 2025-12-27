import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('管理端-系统设置')
@Controller('manager/setting/system')
export class SystemSettingController {
  @Get('base')
  @ApiOperation({ summary: '获取基础设置' })
  getBaseSetting() {
    return { message: '获取基础设置' };
  }

  @Put('base')
  @ApiOperation({ summary: '更新基础设置' })
  updateBaseSetting(@Body() settingData: any) {
    return { message: '更新基础设置' };
  }

  @Get('payment')
  @ApiOperation({ summary: '获取支付设置' })
  getPaymentSetting() {
    return { message: '获取支付设置' };
  }

  @Put('payment')
  @ApiOperation({ summary: '更新支付设置' })
  updatePaymentSetting(@Body() paymentData: any) {
    return { message: '更新支付设置' };
  }

  @Get('sms')
  @ApiOperation({ summary: '获取短信设置' })
  getSmsSetting() {
    return { message: '获取短信设置' };
  }

  @Put('sms')
  @ApiOperation({ summary: '更新短信设置' })
  updateSmsSetting(@Body() smsData: any) {
    return { message: '更新短信设置' };
  }
}
