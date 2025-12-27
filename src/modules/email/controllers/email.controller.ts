import { Controller, Post, Body, Param, Get, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailService } from '../services/email.service';
import { ApiResponseDto } from '../../../common/dto/api-response.dto';
import { SendEmailDto } from '../dto/send-email.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';

@ApiTags('邮件服务')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @ApiOperation({ summary: '发送邮件验证码' })
  @ApiResponse({ status: HttpStatus.OK, description: '邮件验证码发送成功' })
  @Post('send-code')
  async sendCode(@Body() sendEmailDto: SendEmailDto): Promise<ApiResponseDto> {
    await this.emailService.sendCode(
      sendEmailDto.email,
      sendEmailDto.templateCode,
      sendEmailDto.bizId,
    );
    return ApiResponseDto.success(null, '邮件验证码发送成功');
  }

  @ApiOperation({ summary: '验证邮件验证码' })
  @ApiResponse({ status: HttpStatus.OK, description: '邮件验证码验证成功' })
  @Post('verify-code')
  async verifyCode(@Body() verifyEmailDto: VerifyEmailDto): Promise<ApiResponseDto> {
    const isValid = await this.emailService.verifyCode(
      verifyEmailDto.email,
      verifyEmailDto.code,
      verifyEmailDto.bizId,
    );
    if (isValid) {
      return ApiResponseDto.success(null, '邮件验证码验证成功');
    } else {
      return ApiResponseDto.error('邮件验证码验证失败', HttpStatus.BAD_REQUEST);
    }
  }

  @ApiOperation({ summary: '发送普通邮件' })
  @ApiResponse({ status: HttpStatus.OK, description: '邮件发送成功' })
  @Post('send')
  async sendEmail(@Body() sendEmailDto: SendEmailDto): Promise<ApiResponseDto> {
    const result = await this.emailService.sendEmail(
      sendEmailDto.email,
      sendEmailDto.templateCode,
      sendEmailDto.params,
      sendEmailDto.bizId,
    );
    return ApiResponseDto.success(result, '邮件发送成功');
  }

  @ApiOperation({ summary: '获取邮件发送记录' })
  @ApiResponse({ status: HttpStatus.OK, description: '邮件发送记录获取成功' })
  @Get('logs')
  async getEmailLogs(
    @Query('email') email?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ApiResponseDto> {
    const result = await this.emailService.getEmailLogs(email, page, limit);
    return ApiResponseDto.success(result, '邮件发送记录获取成功');
  }

  @ApiOperation({ summary: '获取邮件模板列表' })
  @ApiResponse({ status: HttpStatus.OK, description: '邮件模板列表获取成功' })
  @Get('templates')
  async getEmailTemplates(): Promise<ApiResponseDto> {
    const result = await this.emailService.getEmailTemplates();
    return ApiResponseDto.success(result, '邮件模板列表获取成功');
  }
}
