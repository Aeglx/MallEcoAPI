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
          role: 'USER'
        }
      }
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
          role: 'USER'
        }
      }
    };
  }

  // 用户登出
  async logout(): Promise<any> {
    return {
      code: 200,
      message: '登出成功',
      data: null
    };
  }

  // 刷新token
  async refreshToken(token: string): Promise<any> {
    return {
      code: 200,
      message: 'token刷新成功',
      data: {
        token: 'mock_refresh_token_1234567890'
      }
    };
  }

  // 获取用户信息
  async getUserInfo(): Promise<any> {
    return {
      code: 200,
      message: '获取成功',
      data: {
        id: '1',
        username: 'testuser',
        nickname: '测试用户',
        avatar: '',
        email: 'test@example.com',
        mobile: '13800138000',
        role: 'USER'
      }
    };
  }

  // 修改密码
  async modifyPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
    return {
      code: 200,
      message: '密码修改成功',
      data: null
    };
  }

  // 重置密码
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
    return {
      code: 200,
      message: '密码重置成功',
      data: null
    };
  }

  // 编辑用户信息
  async editUser(editUserDto: EditUserDto): Promise<any> {
    return {
      code: 200,
      message: '用户信息修改成功',
      data: editUserDto
    };
  }

  // 管理员用户登录
  async adminLogin(loginDto: LoginDto): Promise<any> {
    return {
      code: 200,
      message: '管理员登录成功',
      data: {
        token: 'mock_admin_token_1234567890',
        userInfo: {
          id: '1',
          username: loginDto.username,
          nickname: '管理员',
          avatar: '',
          role: 'ADMIN'
        }
      }
    };
  }

  // 管理员用户登出
  async adminLogout(): Promise<any> {
    return {
      code: 200,
      message: '管理员登出成功',
      data: null
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
            status: 1
          }
        ],
        total: 1
      }
    };
  }

  // 添加管理员用户
  async addUser(editUserDto: EditUserDto): Promise<any> {
    return {
      code: 200,
      message: '用户添加成功',
      data: {
        id: '2',
        ...editUserDto
      }
    };
  }

  // 编辑管理员用户
  async editAdminUser(editUserDto: EditUserDto): Promise<any> {
    return {
      code: 200,
      message: '用户信息修改成功',
      data: editUserDto
    };
  }

  // 启用用户
  async enableUser(id: string): Promise<any> {
    return {
      code: 200,
      message: '用户启用成功',
      data: { id }
    };
  }

  // 禁用用户
  async disableUser(id: string): Promise<any> {
    return {
      code: 200,
      message: '用户禁用成功',
      data: { id }
    };
  }

  // 重置用户密码
  async resetUserPassword(userId: string): Promise<any> {
    return {
      code: 200,
      message: '密码重置成功',
      data: { userId }
    };
  }
}