import { Controller, Get, Post, Body, Param, Query, Ip, Headers } from '@nestjs/common';
import { CaptchaService } from '../../captcha/services/captcha.service';
import { SmsService } from '../../sms/services/sms.service';

@Controller('common/common')
export class VerifyController {
  constructor(
    private readonly captchaService: CaptchaService,
    private readonly smsService: SmsService
  ) {}

  // 滑块验证码接口
  @Get('slider/:verificationEnums')
  async getSliderCaptcha(
    @Param('verificationEnums') verificationEnums: string,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string
  ) {
    try {
      const result = await this.captchaService.generateSliderCaptcha(ip, userAgent);
      return {
        success: true,
        result: result,
        message: '获取滑块验证码成功'
      };
    } catch (error) {
      return {
        success: false,
        message: '获取滑块验证码失败',
        error: error.message
      };
    }
  }

  @Post('slider/:verificationEnums')
  async verifySliderCaptcha(
    @Param('verificationEnums') verificationEnums: string,
    @Body() body: { captchaKey: string; captchaValue: number }
  ) {
    try {
      const isValid = await this.captchaService.verifySliderCaptcha(
        body.captchaKey,
        body.captchaValue
      );
      return {
        success: isValid,
        message: isValid ? '验证码验证成功' : '验证码验证失败'
      };
    } catch (error) {
      return {
        success: false,
        message: '验证码验证失败',
        error: error.message
      };
    }
  }

  // 短信验证码接口
  @Get('sms/:verificationEnums/:mobile')
  async sendSmsCode(
    @Param('verificationEnums') verificationEnums: string,
    @Param('mobile') mobile: string,
    @Query() query: any
  ) {
    try {
      // 调用sms服务发送验证码
      await this.smsService.sendCode(mobile, verificationEnums, query.bizId || 'common');
      return {
        success: true,
        message: '短信验证码发送成功'
      };
    } catch (error) {
      return {
        success: false,
        message: '短信验证码发送失败',
        error: error.message
      };
    }
  }
}
