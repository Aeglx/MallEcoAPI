import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称', example: '管理员' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '角色代码', example: 'admin' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: '角色描述', example: '系统管理员角色' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '是否启用', example: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiProperty({ description: '备注', example: '拥有系统所有权限' })
  @IsString()
  @IsOptional()
  remark?: string;
}