import { Controller, Post, Body, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PassportService } from '../../../passport/passport.service';
import { LoginDto, SmsLoginDto, ResetPasswordDto, EditUserDto } from '../../../passport/dto/passport.dto';

@ApiTags('认证')
@Controller('manager/passport')
export class ManagerPassportController {
  constructor(private readonly passportService: PassportService) {}

  // 管理员用户登录
  @Post('user/login')
  async adminLogin(@Body() body: any) {
    // 支持FormData和JSON两种格式
    const loginDto: LoginDto = {
      username: body.username,
      password: body.password
    };
    return this.passportService.adminLogin(loginDto);
  }

  // 管理员用户登出
  @Post('user/logout')
  async adminLogout() {
    return this.passportService.adminLogout();
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