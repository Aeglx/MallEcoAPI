import { Injectable } from '@nestjs/common';

@Injectable()
export class WechatOauthService {
  
  async getOauthUsers() {
    return {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
    };
  }

  async getOauthApps() {
    return {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
    };
  }

  async getOauthTokens() {
    return {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
    };
  }

  async createOauthApp() {
    return { success: true, message: '应用创建成功' };
  }

  async revokeToken() {
    return { success: true, message: '令牌撤销成功' };
  }
}