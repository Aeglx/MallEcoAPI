import { Controller, Post, Body, Param, Get, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SmsService } from '../services/sms.service';
import { ApiResponseDto } from '../../../common/dto/api-response.dto';
import { SendSmsDto } from '../dto/send-sms.dto';
import { VerifySmsDto } from '../dto/verify-sms.dto';

@ApiTags('短信服务')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @ApiOperation({ summary: '发送短信验证码' })
  @ApiResponse({ status: HttpStatus.OK, description: '短信验证码发送成功' })
  @Post('send-code')
  async sendCode(@Body() sendSmsDto: SendSmsDto): Promise<ApiResponseDto> {
    await this.smsService.sendCode(sendSmsDto.phone, sendSmsDto.templateCode, sendSmsDto.bizId);
    return ApiResponseDto.success(null, '短信验证码发送成功');
  }

  @ApiOperation({ summary: '验证短信验证码' })
  @ApiResponse({ status: HttpStatus.OK, description: '短信验证码验证成功' })
  @Post('verify-code')
  async verifyCode(@Body() verifySmsDto: VerifySmsDto): Promise<ApiResponseDto> {
    const isValid = await this.smsService.verifyCode(verifySmsDto.phone, verifySmsDto.code, verifySmsDto.bizId);
    if (isValid) {
      return ApiResponseDto.success(null, '短信验证码验证成功');
    } else {
      return ApiResponseDto.error('短信验证码验证失败', HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({ summary: '发送普通短信' })
  @ApiResponse({ status: HttpStatus.OK, description: '短信发送成功' })
  @Post('send')
  async sendSms(@Body() sendSmsDto: SendSmsDto): Promise<ApiResponseDto> {
    const result = await this.smsService.sendSms(sendSmsDto.phone, sendSmsDto.templateCode, sendSmsDto.params, sendSmsDto.bizId);
    return ApiResponseDto.success(result, '短信发送成功');
  }

  @ApiOperation({ summary: '获取短信发送记录' })
  @ApiResponse({ status: HttpStatus.OK, description: '短信发送记录获取成功' })
  @Get('logs')
  async getSmsLogs(@Query('phone') phone?: string, @Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<ApiResponseDto> {
    const result = await this.smsService.getSmsLogs(phone, page, limit);
    return ApiResponseDto.success(result, '短信发送记录获取成功');
  }

  @ApiOperation({ summary: '获取短信模板列表' })
  @ApiResponse({ status: HttpStatus.OK, description: '短信模板列表获取成功' })
  @Get('templates')
  async getSmsTemplates(): Promise<ApiResponseDto> {
    const result = await this.smsService.getSmsTemplates();
    return ApiResponseDto.success(result, '短信模板列表获取成功');
  }
}