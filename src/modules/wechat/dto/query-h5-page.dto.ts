import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { H5PageStatus } from './create-h5-page.dto';

export class QueryH5PageDto {
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

  @ApiProperty({ description: '页面标题', required: false })
  @IsOptional()
  @IsString({ message: '页面标题必须是字符串' })
  title?: string;

  @ApiProperty({ description: '页面状态', enum: H5PageStatus, required: false })
  @IsOptional()
  @IsEnum(H5PageStatus, { message: '页面状态格式不正确' })
  status?: H5PageStatus;

  @ApiProperty({ description: '开始时间', required: false })
  @IsOptional()
  @IsString({ message: '开始时间必须是字符串' })
  startTime?: string;

  @ApiProperty({ description: '结束时间', required: false })
  @IsOptional()
  @IsString({ message: '结束时间必须是字符串' })
  endTime?: string;
}
