import { Controller, Post, Body, Get, Param, Put, Query } from '@nestjs/common';
import { PassportService } from '../services/passport.service';

@Controller('passport/login')
export class PassportController {
  constructor(private readonly passportService: PassportService) {}

  @Post('userLogin')
  async userLogin(@Body() loginData: any) {
    return await this.passportService.userLogin(loginData);
  }

  @Post('smsLogin')
  async smsLogin(@Body() loginData: any) {
    return await this.passportService.smsLogin(loginData);
  }

  @Post('logout')
  async logout() {
    return await this.passportService.logout();
  }

  @Get('refresh/:token')
  async refreshToken(@Param('token') token: string) {
    return await this.passportService.refreshToken(token);
  }

  @Post('resetPassword')
  async resetPassword(@Body() resetData: any) {
    return await this.passportService.resetPassword(resetData);
  }

  @Post('modifyPass')
  async modifyPass(@Body() modifyData: any) {
    return await this.passportService.modifyPass(modifyData);
  }

  @Post('resetByMobile')
  async resetByMobile(@Body() resetData: any) {
    return await this.passportService.resetByMobile(resetData);
  }
}