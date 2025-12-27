import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class SalesStatisticsQueryDto {
  @ApiProperty({ description: '开始日期 (YYYY-MM-DD)', required: false })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: '结束日期 (YYYY-MM-DD)', required: false })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ description: '商品ID', required: false })
  @IsNumber()
  @IsOptional()
  productId?: number;

  @ApiProperty({ description: '分类ID', required: false })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({
    description: '统计粒度',
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily',
    required: false,
  })
  @IsEnum(['daily', 'weekly', 'monthly'])
  @IsOptional()
  granularity?: string;

  @ApiProperty({ description: '限制数量', default: 10, required: false })
  @IsNumber()
  @IsOptional()
  limit?: number;
}
