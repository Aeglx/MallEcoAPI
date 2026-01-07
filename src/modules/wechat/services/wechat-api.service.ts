import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
  errcode?: number;
  errmsg?: string;
}

interface WechatTemplateItem {
  template_id: string;
  title: string;
  primary_industry: string;
  deputy_industry: string;
  content: string;
  example: string;
}

interface GetTemplateListResponse {
  template_list: WechatTemplateItem[];
  errcode?: number;
  errmsg?: string;
}

interface SendTemplateMessageResponse {
  errcode: number;
  errmsg: string;
  msgid?: number;
}

@Injectable()
export class WechatApiService {
  private readonly logger = new Logger(WechatApiService.name);
  private accessToken: string | null = null;
  private accessTokenExpiresAt: number = 0;
  private readonly appId: string;
  private readonly appSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.appId = this.configService.get<string>('WECHAT_APP_ID') || '';
    this.appSecret = this.configService.get<string>('WECHAT_APP_SECRET') || '';

    if (!this.appId || !this.appSecret) {
      this.logger.warn('微信配置未完整设置，微信API功能可能不可用');
    }
  }

  /**
   * 获取Access Token（带缓存）
   */
  async getAccessToken(): Promise<string> {
    // 如果token未过期，直接返回
    if (this.accessToken && Date.now() < this.accessTokenExpiresAt) {
      return this.accessToken;
    }

    try {
      this.logger.log('获取微信Access Token');

      const url = 'https://api.weixin.qq.com/cgi-bin/token';
      const params = {
        grant_type: 'client_credential',
        appid: this.appId,
        secret: this.appSecret,
      };

      const response = await firstValueFrom(
        this.httpService.get<AccessTokenResponse>(url, { params }),
      );

      const data = response.data;

      if (data.errcode) {
        throw new BadRequestException(`获取Access Token失败: ${data.errmsg} (${data.errcode})`);
      }

      this.accessToken = data.access_token;
      // 提前5分钟过期，确保token有效性
      this.accessTokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;

      this.logger.log('Access Token获取成功');
      return this.accessToken;
    } catch (error: any) {
      this.logger.error('获取Access Token失败', error.stack);
      throw new BadRequestException(`获取Access Token失败: ${error.message}`);
    }
  }

  /**
   * 刷新Access Token（强制重新获取）
   */
  async refreshAccessToken(): Promise<string> {
    this.accessToken = null;
    this.accessTokenExpiresAt = 0;
    return this.getAccessToken();
  }

  /**
   * 获取模板列表
   */
  async getTemplateList(): Promise<WechatTemplateItem[]> {
    try {
      const accessToken = await this.getAccessToken();
      const url = 'https://api.weixin.qq.com/cgi-bin/template/get_all_private_template';
      const params = { access_token: accessToken };

      this.logger.log('获取微信模板列表');

      const response = await firstValueFrom(
        this.httpService.get<GetTemplateListResponse>(url, { params }),
      );

      const data = response.data;

      if (data.errcode && data.errcode !== 0) {
        // 如果token过期，尝试刷新后重试一次
        if (data.errcode === 40001 || data.errcode === 40014) {
          this.logger.warn('Access Token过期，尝试刷新后重试');
          const newToken = await this.refreshAccessToken();
          const retryResponse = await firstValueFrom(
            this.httpService.get<GetTemplateListResponse>(url, {
              params: { access_token: newToken },
            }),
          );
          const retryData = retryResponse.data;
          if (retryData.errcode && retryData.errcode !== 0) {
            throw new BadRequestException(`获取模板列表失败: ${retryData.errmsg} (${retryData.errcode})`);
          }
          return retryData.template_list || [];
        }
        throw new BadRequestException(`获取模板列表失败: ${data.errmsg} (${data.errcode})`);
      }

      this.logger.log(`获取模板列表成功: 共${data.template_list?.length || 0}个模板`);
      return data.template_list || [];
    } catch (error: any) {
      this.logger.error('获取模板列表失败', error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`获取模板列表失败: ${error.message}`);
    }
  }

  /**
   * 发送模板消息
   */
  async sendTemplateMessage(params: {
    touser: string;
    template_id: string;
    url?: string;
    miniprogram?: {
      appid: string;
      pagepath: string;
    };
    data: Record<string, { value: string; color?: string }>;
  }): Promise<SendTemplateMessageResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const url = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${accessToken}`;

      this.logger.log(`发送模板消息: templateId=${params.template_id}, openid=${params.touser}`);

      const requestData = {
        touser: params.touser,
        template_id: params.template_id,
        url: params.url,
        miniprogram: params.miniprogram,
        data: params.data,
      };

      const response = await firstValueFrom(
        this.httpService.post<SendTemplateMessageResponse>(url, requestData),
      );

      const data = response.data;

      // 如果token过期，尝试刷新后重试一次
      if (data.errcode === 40001 || data.errcode === 40014) {
        this.logger.warn('Access Token过期，尝试刷新后重试');
        const newToken = await this.refreshAccessToken();
        const retryResponse = await firstValueFrom(
          this.httpService.post<SendTemplateMessageResponse>(
            `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${newToken}`,
            requestData,
          ),
        );
        const retryData = retryResponse.data;
        if (retryData.errcode && retryData.errcode !== 0) {
          throw new BadRequestException(`发送模板消息失败: ${retryData.errmsg} (${retryData.errcode})`);
        }
        this.logger.log(`模板消息发送成功: msgid=${retryData.msgid}`);
        return retryData;
      }

      if (data.errcode && data.errcode !== 0) {
        throw new BadRequestException(`发送模板消息失败: ${data.errmsg} (${data.errcode})`);
      }

      this.logger.log(`模板消息发送成功: msgid=${data.msgid}`);
      return data;
    } catch (error: any) {
      this.logger.error('发送模板消息失败', error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`发送模板消息失败: ${error.message}`);
    }
  }
}

