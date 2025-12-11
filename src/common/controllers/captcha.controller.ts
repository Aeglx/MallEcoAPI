import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CaptchaService } from '../services/captcha.service';

@ApiTags('验证码')
@Controller('captcha')
export class CaptchaController {
  constructor(private captchaService: CaptchaService) {}

  @Get('generate')
  @ApiOperation({ summary: '生成验证码', description: '生成不同类型的验证码' })
  @ApiResponse({ status: 200, description: '验证码生成成功' })
  async generateCaptcha(
    @Query('type') type: 'numeric' | 'math' | 'slider' = 'numeric',
  ) {
    const captcha = await this.captchaService.generateCaptcha(type);
    
    return {
      success: true,
      data: {
        uuid: captcha.uuid,
        imageData: captcha.data,
        expiresIn: captcha.expiresIn,
        type,
      },
    };
  }

  @Post('verify')
  @ApiOperation({ summary: '验证验证码', description: '验证用户输入的验证码是否正确' })
  @ApiResponse({ status: 200, description: '验证码验证成功' })
  @ApiResponse({ status: 400, description: '验证码验证失败' })
  async verifyCaptcha(
    @Body() body: { uuid: string; code: string },
  ) {
    const { uuid, code } = body;
    
    const isValid = await this.captchaService.verifyCaptcha(uuid, code);
    
    return {
      success: isValid,
      message: isValid ? '验证码正确' : '验证码错误或已过期',
    };
  }

  @Post('slider/verify')
  @ApiOperation({ summary: '验证滑块验证码', description: '验证滑块验证码的位置是否正确' })
  @ApiResponse({ status: 200, description: '滑块验证成功' })
  @ApiResponse({ status: 400, description: '滑块验证失败' })
  async verifySliderCaptcha(
    @Body() body: { uuid: string; xPos: number },
  ) {
    const { uuid, xPos } = body;
    
    const isValid = await this.captchaService.verifySliderCaptcha(uuid, xPos);
    
    return {
      success: isValid,
      message: isValid ? '滑块验证成功' : '滑块验证失败',
    };
  }

  @Get('status/:uuid')
  @ApiOperation({ summary: '获取验证码状态', description: '检查验证码是否存在和过期时间' })
  @ApiResponse({ status: 200, description: '获取状态成功' })
  async getCaptchaStatus(@Param('uuid') uuid: string) {
    const status = await this.captchaService.getCaptchaStatus(uuid);
    
    return {
      success: true,
      data: status,
    };
  }
}