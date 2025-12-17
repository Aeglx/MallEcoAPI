import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { WechatOauthService } from '../services/wechat-oauth.service';

@ApiTags('公众号管理-授权管理')
@Controller('admin/wechat/oauth-user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WechatOauthController {
  constructor(private readonly wechatOauthService: WechatOauthService) {}

  @Get()
  @ApiOperation({ summary: '获取用户授权列表' })
  @ApiResponse({ status: 200, description: '获取用户授权列表成功' })
  getOauthUsers() {
    return this.wechatOauthService.getOauthUsers();
  }

  @Post('revoke')
  @ApiOperation({ summary: '撤销授权' })
  @ApiResponse({ status: 200, description: '授权撤销成功' })
  revokeToken() {
    return this.wechatOauthService.revokeToken();
  }
}