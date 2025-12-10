import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class SearchStatisticsDto {
  @ApiPropertyOptional({ description: '开始日期', example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期', example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '统计类型', example: 'daily', enum: ['daily', 'weekly', 'monthly'] })
  @IsOptional()
  @IsString()
  @IsIn(['daily', 'weekly', 'monthly'])
  type?: string = 'daily';
}

export class SearchTrendResponseDto {
  @ApiProperty({ description: '日期' })
  date: string;

  @ApiProperty({ description: '搜索次数' })
  searchCount: number;

  @ApiProperty({ description: '搜索用户数' })
  userCount: number;

  @ApiProperty({ description: '平均搜索深度' })
  avgSearchDepth: number;
}

export class HotWordStatisticsResponseDto {
  @ApiProperty({ description: '热门搜索词' })
  keyword: string;

  @ApiProperty({ description: '搜索次数' })
  searchCount: number;

  @ApiProperty({ description: '搜索用户数' })
  userCount: number;

  @ApiProperty({ description: '转化率' })
  conversionRate: number;
}