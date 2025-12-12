import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialAuthEntity, SocialPlatform, ClientType } from './entities/social-auth.entity';
import { UsersService } from '../modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../modules/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';

interface SocialConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope?: string;
  [key: string]: any;
}

interface AccessTokenResult {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  openid?: string;
  unionid?: string;
  [key: string]: any;
}

interface UserInfoResult {
  openid?: string;
  unionid?: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);
  private readonly configs: Record<SocialPlatform, SocialConfig>;

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(SocialAuthEntity) private readonly socialAuthRepository: Repository<SocialAuthEntity>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // 初始化社交平台配�?
    this.configs = {
      [SocialPlatform.WECHAT]: {
        clientId: this.configService.get('WECHAT_APP_ID') || '',
        clientSecret: this.configService.get('WECHAT_APP_SECRET') || '',
        redirectUri: `${this.configService.get('APP_URL')}/api/social/callback/wechat`,
        scope: 'snsapi_userinfo',
      },
      [SocialPlatform.WECHAT_MP]: {
        clientId: this.configService.get('WECHAT_MP_APP_ID') || '',
        clientSecret: this.configService.get('WECHAT_MP_APP_SECRET') || '',
        redirectUri: `${this.configService.get('APP_URL')}/api/social/callback/wechat_mp`,
        scope: 'snsapi_userinfo',
      },
      [SocialPlatform.WECHAT_OPEN]: {
        clientId: this.configService.get('WECHAT_OPEN_APP_ID') || '',
        clientSecret: this.configService.get('WECHAT_OPEN_APP_SECRET') || '',
        redirectUri: `${this.configService.get('APP_URL')}/api/social/callback/wechat_open`,
        scope: 'snsapi_login',
      },
      [SocialPlatform.QQ]: {
        clientId: this.configService.get('QQ_APP_ID') || '',
        clientSecret: this.configService.get('QQ_APP_SECRET') || '',
        redirectUri: `${this.configService.get('APP_URL')}/api/social/callback/qq`,
        scope: 'get_user_info',
      },
      [SocialPlatform.WEIBO]: {
        clientId: this.configService.get('WEIBO_APP_ID') || '',
        clientSecret: this.configService.get('WEIBO_APP_SECRET') || '',
        redirectUri: `${this.configService.get('APP_URL')}/api/social/callback/weibo`,
        scope: 'all',
      },
      [SocialPlatform.ALIPAY]: {
        clientId: this.configService.get('ALIPAY_APP_ID') || '',
        clientSecret: this.configService.get('ALIPAY_APP_SECRET') || '',
        redirectUri: `${this.configService.get('APP_URL')}/api/social/callback/alipay`,
        scope: 'auth_user',
      },
      [SocialPlatform.APPLE]: {
        clientId: this.configService.get('APPLE_CLIENT_ID') || '',
        clientSecret: this.configService.get('APPLE_CLIENT_SECRET') || '',
        redirectUri: `${this.configService.get('APP_URL')}/api/social/callback/apple`,
        scope: 'name email',
      },
      [SocialPlatform.GITHUB]: {
        clientId: this.configService.get('GITHUB_CLIENT_ID') || '',
        clientSecret: this.configService.get('GITHUB_CLIENT_SECRET') || '',
        redirectUri: `${this.configService.get('APP_URL')}/api/social/callback/github`,
        scope: 'user:email',
      },
      [SocialPlatform.GOOGLE]: {
        clientId: this.configService.get('GOOGLE_CLIENT_ID') || '',
        clientSecret: this.configService.get('GOOGLE_CLIENT_SECRET') || '',
        redirectUri: `${this.configService.get('APP_URL')}/api/social/callback/google`,
        scope: 'email profile',
      },
    };
  }

  // 生成授权URL
  generateAuthUrl(platform: SocialPlatform, clientType: ClientType = ClientType.PC, state?: string): string {
    const config = this.configs[platform];
    if (!config) {
      throw new HttpException(`Unsupported social platform: ${platform}`, HttpStatus.BAD_REQUEST);
    }

    switch (platform) {
      case SocialPlatform.WECHAT:
      case SocialPlatform.WECHAT_MP:
        return `https://open.weixin.qq.com/connect/oaut../infrastructure/authorize?appid=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=${config.scope}&state=${state || ''}#wechat_redirect`;
      
      case SocialPlatform.WECHAT_OPEN:
        return `https://open.weixin.qq.com/connect/qrconnect?appid=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=${config.scope}&state=${state || ''}#wechat_redirect`;
      
      case SocialPlatform.QQ:
        return `https://graph.qq.com/oauth2../infrastructure/authorize?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=${config.scope}&state=${state || ''}`;
      
      case SocialPlatform.WEIBO:
        return `https://api.weibo.com/oaut../infrastructure/authorize?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=${config.scope}&state=${state || ''}`;
      
      case SocialPlatform.ALIPAY:
        return `https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=${config.clientId}&scope=${config.scope}&redirect_uri=${encodeURIComponent(config.redirectUri)}&state=${state || ''}`;
      
      case SocialPlatform.APPLE:
        return `https://appleid.apple.c../infrastructure/auth/authorize?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=${config.scope}&state=${state || ''}&response_mode=form_post`;
      
      case SocialPlatform.GITHUB:
        return `https://github.com/login/oau../infrastructure/authorize?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${config.scope}&state=${state || ''}`;
      
      case SocialPlatform.GOOGLE:
        return `https://accounts.google.com/o/oauth2/../infrastructure/auth?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=${config.scope}&state=${state || ''}`;
      
      default:
        throw new HttpException(`Unsupported social platform: ${platform}`, HttpStatus.BAD_REQUEST);
    }
  }

  // 获取访问令牌
  async getAccessToken(platform: SocialPlatform, code: string): Promise<AccessTokenResult> {
    const config = this.configs[platform];
    if (!config) {
      throw new HttpException(`Unsupported social platform: ${platform}`, HttpStatus.BAD_REQUEST);
    }

    try {
      let response;
      
      switch (platform) {
        case SocialPlatform.WECHAT:
        case SocialPlatform.WECHAT_MP:
        case SocialPlatform.WECHAT_OPEN:
          response = await axios.get('https://api.weixin.qq.com/sns/oauth2/access_token', {
            params: {
              appid: config.clientId,
              secret: config.clientSecret,
              code,
              grant_type: 'authorization_code',
            },
          });
          break;
        
        case SocialPlatform.QQ:
          response = await axios.get('https://graph.qq.com/oauth2.0/token', {
            params: {
              grant_type: 'authorization_code',
              client_id: config.clientId,
              client_secret: config.clientSecret,
              code,
              redirect_uri: config.redirectUri,
            },
          });
          // 处理QQ返回的字符串格式响应
          const qqResult = new URLSearchParams(response.data);
          return {
            access_token: qqResult.get('access_token'),
            expires_in: parseInt(qqResult.get('expires_in') || '0'),
            refresh_token: qqResult.get('refresh_token'),
          };
        
        case SocialPlatform.WEIBO:
          response = await axios.post('https://api.weibo.com/oauth2/access_token', {
            client_id: config.clientId,
            client_secret: config.clientSecret,
            grant_type: 'authorization_code',
            code,
            redirect_uri: config.redirectUri,
          });
          break;
        
        case SocialPlatform.ALIPAY:
          response = await axios.get('https://openapi.alipay.co./infrastructure/gateway.do', {
            params: {
              app_id: config.clientId,
              method: 'alipay.system.oauth.token',
              charset: 'utf-8',
              sign_type: 'RSA2',
              timestamp: new Date().toISOString().replace(/\.[0-9]+Z/, '+0800').slice(0, 19).replace('T', ' '),
              version: '1.0',
              grant_type: 'authorization_code',
              code,
            },
          });
          return response.data.alipay_system_oauth_token_response;
        
        case SocialPlatform.APPLE:
          response = await axios.post('https://appleid.apple.c../infrastructure/auth/token', {
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: config.redirectUri,
          });
          break;
        
        case SocialPlatform.GITHUB:
          response = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code,
            redirect_uri: config.redirectUri,
          }, {
            headers: { Accept: 'application/json' },
          });
          break;
        
        case SocialPlatform.GOOGLE:
          response = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: config.redirectUri,
          });
          break;
        
        default:
          throw new HttpException(`Unsupported social platform: ${platform}`, HttpStatus.BAD_REQUEST);
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get access token for ${platform}:`, error.message);
      throw new HttpException(`Failed to get access token: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 获取用户信息
  async getUserInfo(platform: SocialPlatform, accessToken: string, openId?: string): Promise<UserInfoResult> {
    try {
      let response;
      
      switch (platform) {
        case SocialPlatform.WECHAT:
        case SocialPlatform.WECHAT_MP:
        case SocialPlatform.WECHAT_OPEN:
          response = await axios.get('https://api.weixin.qq.com/sns/userinfo', {
            params: {
              access_token: accessToken,
              openid: openId,
              lang: 'zh_CN',
            },
          });
          return {
            openid: response.data.openid,
            unionid: response.data.unionid,
            nickname: response.data.nickname,
            avatar: response.data.headimgurl,
          };
        
        case SocialPlatform.QQ:
          // 先获取openid
          const openIdResponse = await axios.get('https://graph.qq.com/oauth2.0/me', {
            params: { access_token: accessToken },
          });
          const openIdData = JSON.parse(openIdResponse.data.match(/callback\((.*)\)/)[1]);
          const qqOpenId = openIdData.openid;
          
          // 再获取用户信�?
          response = await axios.get('https://graph.qq.com/user/get_user_info', {
            params: {
              oauth_consumer_key: this.configs[platform].clientId,
              access_token: accessToken,
              openid: qqOpenId,
              format: 'json',
            },
          });
          
          return {
            openid: qqOpenId,
            nickname: response.data.nickname,
            avatar: response.data.figureurl_qq_2,
          };
        
        case SocialPlatform.WEIBO:
          response = await axios.get('https://api.weibo.com/2/users/show.json', {
            params: {
              access_token: accessToken,
              uid: openId,
            },
          });
          return {
            openid: response.data.idstr,
            nickname: response.data.screen_name,
            avatar: response.data.avatar_large,
          };
        
        case SocialPlatform.ALIPAY:
          response = await axios.get('https://openapi.alipay.co./infrastructure/gateway.do', {
            params: {
              app_id: this.configs[platform].clientId,
              method: 'alipay.user.info.share',
              charset: 'utf-8',
              sign_type: 'RSA2',
              timestamp: new Date().toISOString().replace(/\.[0-9]+Z/, '+0800').slice(0, 19).replace('T', ' '),
              version: '1.0',
              auth_token: accessToken,
            },
          });
          const alipayUser = response.data.alipay_user_info_share_response;
          return {
            openid: alipayUser.user_id,
            nickname: alipayUser.nick_name,
            avatar: alipayUser.avatar,
          };
        
        case SocialPlatform.GITHUB:
          response = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` },
          });
          return {
            openid: response.data.id.toString(),
            nickname: response.data.login,
            avatar: response.data.avatar_url,
            email: response.data.email,
          };
        
        case SocialPlatform.GOOGLE:
          response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          return {
            openid: response.data.sub,
            nickname: response.data.name,
            avatar: response.data.picture,
            email: response.data.email,
          };
        
        default:
          throw new HttpException(`Unsupported social platform: ${platform}`, HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      this.logger.error(`Failed to get user info for ${platform}:`, error.message);
      throw new HttpException(`Failed to get user info: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 社交登录回调处理
  async handleCallback(platform: SocialPlatform, code: string, clientType: ClientType = ClientType.PC): Promise<{ user: User; token: string }> {
    // 获取访问令牌
    const tokenResult = await this.getAccessToken(platform, code);
    
    // 获取用户信息
    const userInfo = await this.getUserInfo(platform, tokenResult.access_token, tokenResult.openid);
    
    // 查找或创建用�?
    let user: User;
    let socialAuth: SocialAuthEntity | null;
    
    // 优先通过unionid查找
    if (userInfo.unionid) {
      socialAuth = await this.socialAuthRepository.findOne({
        where: { union_id: userInfo.unionid, platform },
        relations: ['user'],
      });
    }
    
    // 如果没有找到，通过openid查找
    if (!socialAuth && userInfo.openid) {
      socialAuth = await this.socialAuthRepository.findOne({
        where: { open_id: userInfo.openid, platform },
        relations: ['user'],
      });
    }
    
    // 如果找到了社交账号，返回关联的用�?
    if (socialAuth && socialAuth.user) {
      user = socialAuth.user;
    } else {
      // 否则创建新用�?
      user = await this.usersService.create({
        username: `social_${platform}_${userInfo.openid?.slice(0, 10)}`,
        nickname: userInfo.nickname || `User_${platform}_${userInfo.openid?.slice(0, 6)}`,
        avatar: userInfo.avatar || '',
        email: userInfo.email || '',
        password: '', // 社交登录用户不需要密�?
      });
    }
    
    // 更新或创建社交账号信�?
    if (socialAuth) {
      socialAuth.access_token = tokenResult.access_token;
      socialAuth.refresh_token = tokenResult.refresh_token;
      socialAuth.expires_in = tokenResult.expires_in;
      socialAuth.extra_data = JSON.stringify(userInfo);
      await this.socialAuthRepository.save(socialAuth);
    } else {
      socialAuth = this.socialAuthRepository.create({
        user_id: parseInt(user.id),
        platform,
        client_type: clientType,
        open_id: userInfo.openid || '',
        union_id: userInfo.unionid || null,
        access_token: tokenResult.access_token,
        refresh_token: tokenResult.refresh_token || null,
        expires_in: tokenResult.expires_in || null,
        extra_data: JSON.stringify(userInfo),
      });
      await this.socialAuthRepository.save(socialAuth);
    }
    
    // 生成JWT令牌
    const token = this.jwtService.sign({
      id: user.id,
      username: user.username,
    });
    
    return { user, token };
  }

  // 绑定社交账号
  async bindSocialAccount(userId: number, platform: SocialPlatform, accessToken: string, openId: string, unionId?: string): Promise<SocialAuthEntity> {
    // 检查是否已经绑�?
    const existing = await this.socialAuthRepository.findOne({
      where: { user_id: userId, platform },
    });
    
    if (existing) {
      throw new HttpException('This social account is already bound', HttpStatus.BAD_REQUEST);
    }
    
    // 检查openid是否已经被其他用户绑�?
    const existingByOpenId = await this.socialAuthRepository.findOne({
      where: { open_id: openId, platform },
    });
    
    if (existingByOpenId) {
      throw new HttpException('This social account is already bound to another user', HttpStatus.BAD_REQUEST);
    }
    
    // 创建新的绑定
    const socialAuth = this.socialAuthRepository.create({
      user_id: userId,
      platform,
      client_type: ClientType.PC,
      open_id: openId,
      union_id: unionId || null,
      access_token: accessToken,
    });
    
    return this.socialAuthRepository.save(socialAuth);
  }

  // 解绑社交账号
  async unbindSocialAccount(userId: number, platform: SocialPlatform): Promise<void> {
    const result = await this.socialAuthRepository.delete({
      user_id: userId,
      platform,
    });
    
    if (result.affected === 0) {
      throw new HttpException('Social account not found', HttpStatus.NOT_FOUND);
    }
  }

  // 获取用户绑定的所有社交账�?
  async getUserSocialAccounts(userId: number): Promise<SocialAuthEntity[]> {
    return this.socialAuthRepository.find({
      where: { user_id: userId },
    });
  }
}


