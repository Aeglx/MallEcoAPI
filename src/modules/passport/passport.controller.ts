import { Controller, Post, Body, Get, Param, Put, UseGuards } from '@nestjs/common';
import { PassportService } from './passport.service';
import { LoginDto, SmsLoginDto, ResetPasswordDto, EditUserDto } from './dto/passport.dto';

@Controller('passport')
export class PassportController {
  constructor(private readonly passportService: PassportService) {}

  // 用户登录
  @Post('login/userLogin')
  async login(@Body() loginDto: LoginDto) {
    return this.passportService.login(loginDto);
  }

  // 手机短信登录
  @Post('login/smsLogin')
  async smsLogin(@Body() smsLoginDto: SmsLoginDto) {
    return this.passportService.smsLogin(smsLoginDto);
  }

  // 用户登出
  @Post('login/logout')
  async logout() {
    return this.passportService.logout();
  }

  // 刷新token
  @Get('login/refresh/:token')
  async refreshToken(@Param('token') token: string) {
    return this.passportService.refreshToken(token);
  }

  // 获取用户信息
  @Get('user/info')
  async getUserInfo() {
    return this.passportService.getUserInfo();
  }

  // 修改密码
  @Put('login/modifyPass')
  async modifyPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.passportService.modifyPassword(resetPasswordDto);
  }

  // 重置密码
  @Post('login/resetPassword')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.passportService.resetPassword(resetPasswordDto);
  }

  // 编辑用户信息
  @Put('user/edit')
  async editUser(@Body() editUserDto: EditUserDto) {
    return this.passportService.editUser(editUserDto);
  }

  // 管理员用户登录
  @Post('user/login')
  async adminLogin(@Body() loginDto: LoginDto) {
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
