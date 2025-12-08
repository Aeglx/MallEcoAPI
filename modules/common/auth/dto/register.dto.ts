import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsPhoneNumber, IsEmail } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: '用户名',
    example: 'user123',
    required: true,
    minLength: 3,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({
    description: '密码',
    example: 'Password@123',
    required: true,
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: '手机号',
    example: '13800138000',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber('CN', { message: '请输入有效的手机号码' })
  phone?: string;

  @ApiProperty({
    description: '邮箱',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email?: string;

  @ApiProperty({
    description: '昵称',
    example: '用户123',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;
}
