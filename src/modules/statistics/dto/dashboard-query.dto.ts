import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class DashboardQueryDto {
  @ApiProperty({ description: '开始日期 (YYYY-MM-DD)', required: false })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: '结束日期 (YYYY-MM-DD)', required: false })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: '统计粒度',
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily',
    required: false,
  })
  @IsEnum(['daily', 'weekly', 'monthly'])
  @IsOptional()
  granularity?: string;

  @ApiProperty({
    description: '数据范围',
    enum: ['today', 'yesterday', 'last7days', 'last30days', 'custom'],
    default: 'last7days',
    required: false,
  })
  @IsEnum(['today', 'yesterday', 'last7days', 'last30days', 'custom'])
  @IsOptional()
  range?: string;

  @ApiProperty({
    description: '图表类型',
    enum: ['line', 'bar', 'pie', 'table'],
    default: 'line',
    required: false,
  })
  @IsEnum(['line', 'bar', 'pie', 'table'])
  @IsOptional()
  chartType?: string;
}
