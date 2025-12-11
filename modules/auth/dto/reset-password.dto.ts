import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: '邮箱' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '验证码' })
  @IsString()
  @MinLength(4)
  @MaxLength(6)
  code: string;

  @ApiProperty({ description: '新密码' })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  newPassword: string;

  @ApiProperty({ description: '确认新密码' })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  confirmPassword: string;

  // 自定义验证
  validate() {
    if (this.newPassword !== this.confirmPassword) {
      throw new Error('新密码和确认密码不一致');
    }
  }
}