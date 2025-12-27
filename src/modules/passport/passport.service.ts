import { Injectable } from '@nestjs/common';
import { LoginDto, SmsLoginDto, ResetPasswordDto, EditUserDto } from './dto/passport.dto';

@Injectable()
export class PassportService {
  // 用户登录
  async login(loginDto: LoginDto): Promise<any> {
    return {
      code: 200,
      message: '登录成功',
      data: {
        token: 'mock_token_1234567890',
        userInfo: {
          id: '1',
          username: loginDto.username,
          nickname: '用户昵称',
          avatar: '',
          role: 'USER',
        },
      },
    };
  }

  // 手机短信登录
  async smsLogin(smsLoginDto: SmsLoginDto): Promise<any> {
    return {
      code: 200,
      message: '短信登录成功',
      data: {
        token: 'mock_sms_token_1234567890',
        userInfo: {
          id: '1',
          username: smsLoginDto.mobile,
          nickname: '用户昵称',
          avatar: '',
          role: 'USER',
        },
      },
    };
  }

  // 用户登出
  async logout(): Promise<any> {
    return {
      code: 200,
      message: '登出成功',
      data: null,
    };
  }

  // 刷新token
  async refreshToken(token: string): Promise<any> {
    return {
      code: 200,
      message: 'token刷新成功',
      data: {
        token: 'mock_refresh_token_1234567890',
      },
    };
  }

  // 获取用户信息
  async getUserInfo(): Promise<any> {
    // 返回格式与登录接口保持一致
    return {
      code: 200,
      message: '获取成功',
      data: {
        id: '1',
        username: 'admin',
        nickname: '管理员',
        avatar: '',
        email: 'admin@malleco.com',
        mobile: '13800000001',
        role: 'ADMIN',
      },
    };
  }

  // 修改密码
  async modifyPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
    return {
      code: 200,
      message: '密码修改成功',
      data: null,
    };
  }

  // 重置密码
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
    return {
      code: 200,
      message: '密码重置成功',
      data: null,
    };
  }

  // 编辑用户信息
  async editUser(editUserDto: EditUserDto): Promise<any> {
    return {
      code: 200,
      message: '用户信息修改成功',
      data: editUserDto,
    };
  }

  // 管理员用户登录
  async adminLogin(loginDto: LoginDto): Promise<any> {
    try {
      console.log('收到登录请求:', {
        username: loginDto.username,
        passwordLength: loginDto.password?.length,
      });

      // 验证用户名和密码
      if (!loginDto.username || !loginDto.password) {
        console.warn('登录参数验证失败: 用户名或密码为空');
        return {
          success: false,
          message: '用户名或密码不能为空',
        };
      }

      // TODO: 实现真实的登录逻辑（查询数据库、验证密码等）
      // 目前返回mock数据
      console.log('登录成功，返回mock数据');
      return {
        success: true,
        message: '登录成功',
        result: {
          accessToken: 'mock_admin_token_1234567890',
          refreshToken: 'mock_refresh_token_1234567890',
          userInfo: {
            id: '1',
            username: loginDto.username,
            nickname: '管理员',
            avatar: '',
            role: 'ADMIN',
          },
        },
      };
    } catch (error: any) {
      console.error('登录失败:', error);
      console.error('错误堆栈:', error.stack);
      return {
        success: false,
        message: error.message || '登录失败，请稍后重试',
      };
    }
  }

  // 管理员用户登出
  async adminLogout(): Promise<any> {
    return {
      code: 200,
      message: '管理员登出成功',
      data: null,
    };
  }

  // 管理员获取用户信息
  async getUsersByCondition(): Promise<any> {
    return {
      code: 200,
      message: '获取成功',
      data: {
        list: [
          {
            id: '1',
            username: 'admin',
            nickname: '管理员',
            avatar: '',
            email: 'admin@example.com',
            mobile: '13800138000',
            role: 'ADMIN',
            status: 1,
          },
        ],
        total: 1,
      },
    };
  }

  // 添加管理员用户
  async addUser(editUserDto: EditUserDto): Promise<any> {
    return {
      code: 200,
      message: '用户添加成功',
      data: {
        id: '2',
        ...editUserDto,
      },
    };
  }

  // 编辑管理员用户
  async editAdminUser(editUserDto: EditUserDto): Promise<any> {
    return {
      code: 200,
      message: '用户信息修改成功',
      data: editUserDto,
    };
  }

  // 启用用户
  async enableUser(id: string): Promise<any> {
    return {
      code: 200,
      message: '用户启用成功',
      data: { id },
    };
  }

  // 禁用用户
  async disableUser(id: string): Promise<any> {
    return {
      code: 200,
      message: '用户禁用成功',
      data: { id },
    };
  }

  // 重置用户密码
  async resetUserPassword(userId: string): Promise<any> {
    return {
      code: 200,
      message: '密码重置成功',
      data: { userId },
    };
  }
}
