import { IsNotEmpty, IsPhoneNumber, IsString, IsOptional } from 'class-validator';

export class SendSmsDto {
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsPhoneNumber('CN', { message: '手机号格式不正确' })
  phone: string;

  @IsNotEmpty({ message: '模板代码不能为空' })
  @IsString({ message: '模板代码必须是字符串' })
  templateCode: string;

  @IsOptional()
  params?: Record<string, any>;

  @IsOptional()
  @IsString({ message: '业务ID必须是字符串' })
  bizId?: string;
}
