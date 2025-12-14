import { IsNotEmpty, IsEmail, IsString, IsOptional } from 'class-validator';

export class SendEmailDto {
  @IsNotEmpty({ message: '邮箱地址不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @IsNotEmpty({ message: '模板代码不能为空' })
  @IsString({ message: '模板代码必须是字符串' })
  templateCode: string;

  @IsOptional()
  params?: Record<string, any>;

  @IsOptional()
  @IsString({ message: '业务ID必须是字符串' })
  bizId?: string;
}
