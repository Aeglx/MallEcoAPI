import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { WechatOauthService } from '../services/wechat-oauth.service';
import { CreateOauthAppDto } from '../dto/create-oauth-app.dto';
import { UpdateOauthAppDto } from '../dto/update-oauth-app.dto';
import { QueryOauthAppDto } from '../dto/query-oauth-app.dto';

@ApiTags('公众号管理-授权应用管理')
@Controller('admin/wechat/oauth-app')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WechatOauthAppController {
  constructor(private readonly wechatOauthService: WechatOauthService) {}

  @Get()
  @ApiOperation({ summary: '获取授权应用列表' })
  @ApiResponse({ status: 200, description: '获取授权应用列表成功' })
  getOauthApps(@Query() queryDto: QueryOauthAppDto) {
    return this.wechatOauthService.getOauthApps(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取授权应用详情' })
  @ApiResponse({ status: 200, description: '获取授权应用详情成功' })
  getOauthAppById(@Param('id') id: string) {
    return this.wechatOauthService.getOauthAppById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建授权应用' })
  @ApiResponse({ status: 201, description: '授权应用创建成功' })
  createOauthApp(@Body() createDto: CreateOauthAppDto) {
    return this.wechatOauthService.createOauthApp(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新授权应用' })
  @ApiResponse({ status: 200, description: '授权应用更新成功' })
  updateOauthApp(@Param('id') id: string, @Body() updateDto: UpdateOauthAppDto) {
    return this.wechatOauthService.updateOauthApp(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除授权应用' })
  @ApiResponse({ status: 200, description: '授权应用删除成功' })
  deleteOauthApp(@Param('id') id: string) {
    return this.wechatOauthService.deleteOauthApp(id);
  }

  @Post(':id/generate-secret')
  @ApiOperation({ summary: '生成应用密钥' })
  @ApiResponse({ status: 200, description: '应用密钥生成成功' })
  generateAppSecret(@Param('id') id: string) {
    return this.wechatOauthService.generateAppSecret(id);
  }
}