import { IsNotEmpty, IsPhoneNumber, IsString, IsOptional } from 'class-validator';

export class VerifySmsDto {
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsPhoneNumber('CN', { message: '手机号格式不正确' })
  phone: string;

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
