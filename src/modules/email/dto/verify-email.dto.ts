import { IsNotEmpty, IsEmail, IsString, IsOptional } from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty({ message: '邮箱地址不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString({ message: '验证码必须是字符串' })
  code: string;

  @IsNotEmpty({ message: '业务类型不能为空' })
  @IsString({ message: '业务类型必须是字符串' })
  bizId: string;

  @IsOptional()
  @IsString({ message: 'IP地址必须是字符串' })
  ip?: string;
}
