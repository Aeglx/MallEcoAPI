import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ description: '权限名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '权限标识' })
  @IsString()
  code: string;

  @ApiProperty({ description: '权限描述', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '权限类型', default: 1 })
  @IsNumber()
  @IsOptional()
  type?: number;

  @ApiProperty({ description: '所属模块', required: false })
  @IsString()
  @IsOptional()
  module?: string;

  @ApiProperty({ description: '父级权限ID', required: false })
  @IsNumber()
  @IsOptional()
  parentId?: number;

  @ApiProperty({ description: '排序号', default: 0 })
  @IsNumber()
  @IsOptional()
  sort?: number;
}
