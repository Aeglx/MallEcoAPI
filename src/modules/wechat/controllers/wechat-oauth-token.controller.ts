import { Controller, Get, Post, Param, Query, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { WechatOauthService } from '../services/wechat-oauth.service';
import { QueryOauthTokenDto } from '../dto/query-oauth-token.dto';

@ApiTags('公众号管理-授权令牌管理')
@Controller('admin/wechat/oauth-token')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WechatOauthTokenController {
  constructor(private readonly wechatOauthService: WechatOauthService) {}

  @Get()
  @ApiOperation({ summary: '获取授权令牌列表' })
  @ApiResponse({ status: 200, description: '获取授权令牌列表成功' })
  getOauthTokens(@Query() queryDto: QueryOauthTokenDto) {
    return this.wechatOauthService.getOauthTokens(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取授权令牌详情' })
  @ApiResponse({ status: 200, description: '获取授权令牌详情成功' })
  getOauthTokenById(@Param('id') id: string) {
    return this.wechatOauthService.getOauthTokenById(id);
  }

  @Post(':id/revoke')
  @ApiOperation({ summary: '撤销授权令牌' })
  @ApiResponse({ status: 200, description: '授权令牌撤销成功' })
  revokeToken(@Param('id') id: string) {
    return this.wechatOauthService.revokeToken(id);
  }

  @Post('batch-revoke')
  @ApiOperation({ summary: '批量撤销令牌' })
  @ApiResponse({ status: 200, description: '批量撤销令牌成功' })
  revokeTokensByUser(@Body() body: { userId: string; appId: string }) {
    return this.wechatOauthService.revokeTokensByUser(body.userId, body.appId);
  }
}
