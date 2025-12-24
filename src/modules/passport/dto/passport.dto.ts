import { IsString, IsNotEmpty, IsEmail, IsMobilePhone, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;
}

export class SmsLoginDto {
  @IsMobilePhone('zh-CN', {}, { message: '手机号格式不正确' })
  @IsNotEmpty({ message: '手机号不能为空' })
  mobile: string;

  @IsString()
  @IsNotEmpty({ message: '验证码不能为空' })
  code: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: '旧密码不能为空' })
  oldPassword: string;

  @IsString()
  @IsNotEmpty({ message: '新密码不能为空' })
  newPassword: string;

  @IsString()
  @IsNotEmpty({ message: '确认密码不能为空' })
  confirmPassword: string;
}

export class EditUserDto {
  @IsString()
  @IsOptional()
  nickname?: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  email?: string;

  @IsMobilePhone('zh-CN', {}, { message: '手机号格式不正确' })
  @IsOptional()
  mobile?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}