import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { PassportService } from '../../../passport/passport.service';
import {
  LoginDto,
  SmsLoginDto,
  ResetPasswordDto,
  EditUserDto,
} from '../../../passport/dto/passport.dto';

@ApiTags('认证')
@Controller('manager/passport')
export class ManagerPassportController {
  constructor(private readonly passportService: PassportService) {}

  // 管理员用户登录
  @Post('user/login')
  @UseInterceptors(AnyFilesInterceptor())
  async adminLogin(@Body() body: any) {
    try {
      console.log('收到登录请求，body:', body);
      console.log('body类型:', typeof body);

      // 检查body是否存在
      if (!body) {
        console.warn('请求体为空');
        return {
          success: false,
          message: '请求参数不能为空',
        };
      }

      // 支持FormData和JSON两种格式
      const loginDto: LoginDto = {
        username: body?.username || '',
        password: body?.password || '',
      };

      console.log('解析后的loginDto:', {
        username: loginDto.username,
        passwordLength: loginDto.password?.length,
      });

      const result = await this.passportService.adminLogin(loginDto);
      console.log('登录结果:', result);
      return result;
    } catch (error: any) {
      console.error('登录接口错误:', error);
      console.error('错误堆栈:', error.stack);
      return {
        success: false,
        message: error.message || '登录失败，请稍后重试',
      };
    }
  }

  // 管理员用户登出
  @Post('user/logout')
  async adminLogout() {
    return this.passportService.adminLogout();
  }

  // 获取当前登录用户信息
  @Get('user/info')
  async getUserInfo() {
    try {
      const result = await this.passportService.getUserInfo();
      // 转换响应格式，匹配前端期望的格式
      if (result.code === 200) {
        return {
          success: true,
          result: result.data,
        };
      } else {
        return {
          success: false,
          message: result.message || '获取用户信息失败',
        };
      }
    } catch (error: any) {
      console.error('获取用户信息错误:', error);
      return {
        success: false,
        message: error.message || '获取用户信息失败，请稍后重试',
      };
    }
  }

  // 管理员获取用户信息
  @Get('user/getByCondition')
  async getUsersByCondition() {
    return this.passportService.getUsersByCondition();
  }

  // 添加管理员用户
  @Post('user')
  async addUser(@Body() editUserDto: EditUserDto) {
    return this.passportService.addUser(editUserDto);
  }

  // 编辑管理员用户
  @Put('user/admin/edit')
  async editAdminUser(@Body() editUserDto: EditUserDto) {
    return this.passportService.editAdminUser(editUserDto);
  }

  // 启用用户
  @Put('user/enable/:id')
  async enableUser(@Param('id') id: string) {
    return this.passportService.enableUser(id);
  }

  // 删除用户
  @Put('user/disable/:id')
  async disableUser(@Param('id') id: string) {
    return this.passportService.disableUser(id);
  }

  // 重置用户密码
  @Post('user/resetPassword/:userId')
  async resetUserPassword(@Param('userId') userId: string) {
    return this.passportService.resetUserPassword(userId);
  }
}
