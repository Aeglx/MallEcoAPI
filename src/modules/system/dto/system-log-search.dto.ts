import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDate, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class SystemLogSearchDto {
  @ApiProperty({ description: '日志类型', required: false })
  @IsString()
  @IsOptional()
  logType?: string;

  @ApiProperty({ description: '日志级别', required: false })
  @IsIn(['debug', 'info', 'warn', 'error', 'fatal'])
  @IsOptional()
  level?: string;

  @ApiProperty({ description: '模块名称', required: false })
  @IsString()
  @IsOptional()
  module?: string;

  @ApiProperty({ description: '用户名', required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ description: '用户ID', required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : undefined)
  userId?: number;

  @ApiProperty({ description: '开始时间', required: false })
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  startTime?: Date;

  @ApiProperty({ description: '结束时间', required: false })
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  endTime?: Date;

  @ApiProperty({ description: '关键词搜索', required: false })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiProperty({ description: '页码', default: 1 })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : 1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', default: 20 })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : 20)
  limit?: number = 20;

  @ApiProperty({ description: '排序字段', default: 'createdAt' })
  @IsString()
  @IsOptional()
  orderBy?: string = 'createdAt';

  @ApiProperty({ description: '排序方式', default: 'DESC' })
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order?: 'ASC' | 'DESC' = 'DESC';
}