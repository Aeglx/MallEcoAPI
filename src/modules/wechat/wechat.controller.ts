import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { WechatService } from './wechat.service';

@ApiTags('公众号管理')
@Controller('admin/wechat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WechatController {
  constructor(private readonly wechatService: WechatService) {}

  @Get('overview')
  @ApiOperation({ summary: '公众号概览' })
  @ApiResponse({ status: 200, description: '获取公众号概览信息' })
  getOverview() {
    return this.wechatService.getOverview();
  }

  @Get('config')
  @ApiOperation({ summary: '获取公众号配置' })
  @ApiResponse({ status: 200, description: '获取公众号配置信息' })
  getConfig() {
    return this.wechatService.getConfig();
  }

  @Post('config')
  @ApiOperation({ summary: '更新公众号配置' })
  @ApiResponse({ status: 200, description: '更新公众号配置' })
  updateConfig(@Body() configData: any) {
    return this.wechatService.updateConfig(configData);
  }

  @Get('stats')
  @ApiOperation({ summary: '公众号统计数据' })
  @ApiResponse({ status: 200, description: '获取公众号统计数据' })
  getStats() {
    return this.wechatService.getStats();
  }
}