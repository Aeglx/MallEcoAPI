import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class PermissionSearchDto {
  @ApiProperty({ description: '权限名称', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: '权限标识', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ description: '权限类型', required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ description: '所属模块', required: false })
  @IsString()
  @IsOptional()
  module?: string;

  @ApiProperty({ description: '页码', default: 1 })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiProperty({ description: '每页数量', default: 10 })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiProperty({ description: '排序字段', default: 'id' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiProperty({ description: '排序方向', default: 'DESC' })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}