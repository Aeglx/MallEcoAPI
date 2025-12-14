import { Controller, Get, Post, Body, Ip, Headers } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CaptchaService } from '../services/captcha.service';
import { VerifyCaptchaDto } from '../dto/verify-captcha.dto';

@ApiTags('验证码管理')
@Controller('captcha')
export class CaptchaController {
  constructor(private readonly captchaService: CaptchaService) {}

  @ApiOperation({ summary: '获取滑块验证码' })
  @ApiResponse({ status: 200, description: '获取滑块验证码成功' })
  @Get('slider')
  async getSliderCaptcha(
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.captchaService.generateSliderCaptcha(ip, userAgent);
    return {
      success: true,
      data: result,
      message: '获取滑块验证码成功',
    };
  }

  @ApiOperation({ summary: '验证滑块验证码' })
  @ApiBody({ type: VerifyCaptchaDto })
  @ApiResponse({ status: 200, description: '验证码验证成功' })
  @Post('verify')
  async verifyCaptcha(@Body() verifyCaptchaDto: VerifyCaptchaDto) {
    const isValid = await this.captchaService.verifySliderCaptcha(
      verifyCaptchaDto.captchaKey,
      verifyCaptchaDto.captchaValue,
    );

    return {
      success: isValid,
      message: isValid ? '验证码验证成功' : '验证码验证失败',
    };
  }
}
