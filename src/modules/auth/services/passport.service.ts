import { Injectable } from '@nestjs/common';

@Injectable()
export class PassportService {
  async userLogin(loginData: any) {
    // 用户登录逻辑
    return {
      success: true,
      data: {
        accessToken: 'jwt-token-example',
        refreshToken: 'refresh-token-example',
        userInfo: { username: loginData.username },
      },
      message: '登录成功',
    };
  }

  async smsLogin(loginData: any) {
    // 短信验证码登录逻辑
    return {
      success: true,
      data: {
        accessToken: 'jwt-token-example',
        refreshToken: 'refresh-token-example',
        userInfo: { mobile: loginData.mobile },
      },
      message: '短信登录成功',
    };
  }

  async logout() {
    // 退出登录逻辑
    return {
      success: true,
      message: '退出成功',
    };
  }

  async refreshToken(token: string) {
    // 刷新token逻辑
    return {
      success: true,
      data: {
        accessToken: 'new-jwt-token-example',
        refreshToken: 'new-refresh-token-example',
      },
      message: 'Token刷新成功',
    };
  }

  async resetPassword(resetData: any) {
    // 重置密码逻辑
    return {
      success: true,
      message: '密码重置成功',
    };
  }

  async modifyPass(modifyData: any) {
    // 修改密码逻辑
    return {
      success: true,
      message: '密码修改成功',
    };
  }

  async resetByMobile(resetData: any) {
    // 通过手机重置密码逻辑
    return {
      success: true,
      message: '手机重置密码成功',
    };
  }
}
