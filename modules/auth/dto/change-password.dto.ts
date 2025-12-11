import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: '旧密码' })
  @IsString()
  @MinLength(6)
  oldPassword: string;

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
    
    if (this.oldPassword === this.newPassword) {
      throw new Error('新密码不能与旧密码相同');
    }
  }
}