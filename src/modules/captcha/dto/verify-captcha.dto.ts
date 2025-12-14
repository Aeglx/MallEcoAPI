import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class VerifyCaptchaDto {
  @ApiProperty({ description: '验证码唯一标识', required: true })
  @IsNotEmpty({ message: '验证码唯一标识不能为空' })
  @IsString()
  captchaKey: string;

  @ApiProperty({ description: '用户输入的验证码值(滑块位置)', required: true })
  @IsNotEmpty({ message: '验证码值不能为空' })
  @IsNumber({}, { message: '验证码值必须是数字' })
  captchaValue: number;
}
