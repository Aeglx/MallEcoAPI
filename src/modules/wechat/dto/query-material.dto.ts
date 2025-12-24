import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MaterialType, MaterialStatus } from '../services/wechat-material.service';

export class QueryMaterialDto {
  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '页码必须是数字' })
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '每页数量必须是数字' })
  pageSize?: number = 10;

  @ApiProperty({ description: '素材标题', required: false })
  @IsOptional()
  @IsString({ message: '素材标题必须是字符串' })
  title?: string;

  @ApiProperty({ description: '素材类型', enum: MaterialType, required: false })
  @IsOptional()
  @IsEnum(MaterialType, { message: '素材类型格式不正确' })
  materialType?: MaterialType;

  @ApiProperty({ description: '素材状态', enum: MaterialStatus, required: false })
  @IsOptional()
  @IsEnum(MaterialStatus, { message: '素材状态格式不正确' })
  status?: MaterialStatus;

  @ApiProperty({ description: '开始时间', required: false })
  @IsOptional()
  @IsString({ message: '开始时间必须是字符串' })
  startTime?: string;

  @ApiProperty({ description: '结束时间', required: false })
  @IsOptional()
  @IsString({ message: '结束时间必须是字符串' })
  endTime?: string;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  enabled?: boolean;
}