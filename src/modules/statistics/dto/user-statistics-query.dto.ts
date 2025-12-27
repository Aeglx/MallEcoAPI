import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class UserStatisticsQueryDto {
  @ApiProperty({ description: '开始日期 (YYYY-MM-DD)', required: false })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: '结束日期 (YYYY-MM-DD)', required: false })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: '用户类型',
    enum: ['buyer', 'seller'],
    required: false,
  })
  @IsEnum(['buyer', 'seller'])
  @IsOptional()
  userType?: string;

  @ApiProperty({ description: '用户来源', required: false })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({
    description: '统计粒度',
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily',
    required: false,
  })
  @IsEnum(['daily', 'weekly', 'monthly'])
  @IsOptional()
  granularity?: string;
}
