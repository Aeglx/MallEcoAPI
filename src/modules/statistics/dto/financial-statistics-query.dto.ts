import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class FinancialStatisticsQueryDto {
  @ApiProperty({ description: '开始日期 (YYYY-MM-DD)', required: false })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: '结束日期 (YYYY-MM-DD)', required: false })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ 
    description: '账户类型', 
    enum: ['income', 'expense'], 
    required: false 
  })
  @IsEnum(['income', 'expense'])
  @IsOptional()
  accountType?: string;

  @ApiProperty({ description: '交易类型', required: false })
  @IsString()
  @IsOptional()
  transactionType?: string;

  @ApiProperty({ 
    description: '统计粒度', 
    enum: ['daily', 'weekly', 'monthly'], 
    default: 'daily',
    required: false 
  })
  @IsEnum(['daily', 'weekly', 'monthly'])
  @IsOptional()
  granularity?: string;
}