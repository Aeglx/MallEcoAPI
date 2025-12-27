import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
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
