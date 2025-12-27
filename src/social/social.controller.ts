import { Controller, Get, Post, Query, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { SocialPlatform, ClientType } from './entities/social-auth.entity';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('认证')
@Controller('api/social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  /**
   * 获取社交登录授权URL
   * @param platform 社交平台
   * @param clientType 客户端类型
   * @param state 状态参数
   * @returns 授权URL
   */
  @Get('auth/:platform')
  getAuthUrl(
    @Param('platform') platform: SocialPlatform,
    @Query('clientType') clientType: ClientType = ClientType.PC,
    @Query('state') state?: string,
  ) {
    const authUrl = this.socialService.generateAuthUrl(platform, clientType, state);
    return {
      success: true,
      data: { authUrl },
    };
  }

  /**
   * 处理社交登录回调
   * @param platform 社交平台
   * @param code 授权码
   * @param state 状态参数
   * @param clientType 客户端类型
   * @returns 用户信息和JWT令牌
   */
  @Get('callback/:platform')
  async handleCallback(
    @Param('platform') platform: SocialPlatform,
    @Query('code') code: string,
    @Query('state') state?: string,
    @Query('clientType') clientType: ClientType = ClientType.PC,
  ) {
    const result = await this.socialService.handleCallback(platform, code, clientType);
    return {
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
    };
  }

  /**
   * 绑定社交账号
   * @param req 请求对象，包含当前用户信息
   * @param platform 社交平台
   * @param body 请求体，包含accessToken、openId和unionId
   * @returns 绑定结果
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('bind/:platform')
  async bindSocialAccount(
    @Request() req,
    @Param('platform') platform: SocialPlatform,
    @Body() body: { accessToken: string; openId: string; unionId?: string },
  ) {
    const socialAuth = await this.socialService.bindSocialAccount(
      req.user.id,
      platform,
      body.accessToken,
      body.openId,
      body.unionId,
    );
    return {
      success: true,
      data: socialAuth,
    };
  }

  /**
   * 解绑社交账号
   * @param req 请求对象，包含当前用户信息
   * @param platform 社交平台
   * @returns 解绑结果
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('unbind/:platform')
  async unbindSocialAccount(@Request() req, @Param('platform') platform: SocialPlatform) {
    await this.socialService.unbindSocialAccount(req.user.id, platform);
    return {
      success: true,
      message: 'Social account unbound successfully',
    };
  }

  /**
   * 获取用户绑定的所有社交账号
   * @param req 请求对象，包含当前用户信息
   * @returns 社交账号列表
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('accounts')
  async getUserSocialAccounts(@Request() req) {
    const accounts = await this.socialService.getUserSocialAccounts(req.user.id);
    return {
      success: true,
      data: accounts,
    };
  }
}
