import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsMobilePhone, 
  MinLength, 
  MaxLength,
  Equals,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: '手机号', required: false })
  @IsOptional()
  @IsMobilePhone()
  phone?: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @ApiProperty({ description: '确认密码' })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  confirmPassword: string;

  @ApiProperty({ description: '昵称', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;

  @ApiProperty({ description: '头像', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '验证码', required: false })
  @IsOptional()
  @IsString()
  verificationCode?: string;

  @ApiProperty({ description: '邀请码', required: false })
  @IsOptional()
  @IsString()
  inviteCode?: string;

  @ApiProperty({ description: '注册IP', required: false })
  @IsOptional()
  @IsString()
  ip?: string;

  // 自定义验证：确认密码
  // 这个验证会在transform方法中被调用
  validate() {
    if (this.password !== this.confirmPassword) {
      throw new Error('密码和确认密码不一致');
    }
  }
}