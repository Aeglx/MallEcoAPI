import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class ArticleSearchDto {
  @ApiProperty({ description: '关键词搜索', example: '电商', required: false })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiProperty({ description: '分类ID', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  categoryId?: number;

  @ApiProperty({ description: '标签ID', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  tagId?: number;

  @ApiProperty({ description: '作者', example: '管理员', required: false })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({ description: '状态', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  status?: number;

  @ApiProperty({ description: '是否推荐', example: true, required: false })
  @IsOptional()
  isRecommended?: boolean;

  @ApiProperty({ description: '开始时间', example: '2024-01-01', required: false })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiProperty({ description: '结束时间', example: '2024-12-31', required: false })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiProperty({ description: '页码', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', example: 20, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 20;

  @ApiProperty({ description: '排序字段', example: 'createdAt', required: false })
  @IsString()
  @IsOptional()
  sortField?: string = 'createdAt';

  @ApiProperty({ description: '排序方式', example: 'DESC', required: false })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}