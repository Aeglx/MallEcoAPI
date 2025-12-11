import { IsString, IsOptional, IsEmail, IsMobilePhone } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '用户名/邮箱/手机号' })
  @IsString()
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  password: string;

  @ApiProperty({ description: '验证码', required: false })
  @IsOptional()
  @IsString()
  captcha?: string;

  @ApiProperty({ description: '登录IP', required: false })
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiProperty({ 
    description: '登录方式',
    enum: ['password', 'sms', 'wechat', 'alipay'],
    required: false
  })
  @IsOptional()
  loginType?: string;
}