import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: '用户名', example: 'newuser' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: '邮箱', example: 'newuser@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '手机号', example: '13800138000', required: false })
  phone?: string;

  @ApiProperty({ description: '昵称', example: '新用户', required: false })
  nickname?: string;
}
