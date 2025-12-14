import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
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