import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { WechatOauthService } from '../services/wechat-oauth.service';
import { QueryOauthUserDto } from '../dto/query-oauth-user.dto';

@ApiTags('公众号管理-授权用户管理')
@Controller('admin/wechat/oauth-user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WechatOauthController {
  constructor(private readonly wechatOauthService: WechatOauthService) {}

  @Get()
  @ApiOperation({ summary: '获取用户授权列表' })
  @ApiResponse({ status: 200, description: '获取用户授权列表成功' })
  getOauthUsers(@Query() queryDto: QueryOauthUserDto) {
    return this.wechatOauthService.getOauthUsers(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户授权详情' })
  @ApiResponse({ status: 200, description: '获取用户授权详情成功' })
  getOauthUserById(@Param('id') id: string) {
    return this.wechatOauthService.getOauthUserById(id);
  }

  @Get('stats/summary')
  @ApiOperation({ summary: '获取授权统计信息' })
  @ApiResponse({ status: 200, description: '获取授权统计信息成功' })
  getOauthStats() {
    return this.wechatOauthService.getOauthStats();
  }
}