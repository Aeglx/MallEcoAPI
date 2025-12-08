import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: '用户名或手机号或邮箱',
    example: 'user123',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  usernameOrPhoneOrEmail: string;

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
}
