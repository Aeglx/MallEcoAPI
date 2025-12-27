import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class OrderStatisticsQueryDto {
  @ApiProperty({ description: '开始日期 (YYYY-MM-DD)', required: false })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: '结束日期 (YYYY-MM-DD)', required: false })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: '订单状态',
    enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunded'],
    required: false,
  })
  @IsEnum(['pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunded'])
  @IsOptional()
  orderStatus?: string;

  @ApiProperty({ description: '支付方式', required: false })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

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
