import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: '邮箱', example: 'admin@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: '真实姓名', example: '张三' })
  @IsString()
  @IsOptional()
  realName?: string;

  @ApiProperty({ description: '昵称', example: '管理员' })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({ description: '头像URL', example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ description: '部门ID', example: 1 })
  @IsOptional()
  departmentId?: number;

  @ApiProperty({ description: '是否启用', example: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiProperty({ description: '备注', example: '系统管理员' })
  @IsString()
  @IsOptional()
  remark?: string;
}
