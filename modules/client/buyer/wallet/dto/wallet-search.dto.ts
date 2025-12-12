import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WalletSearchDto {
  @ApiProperty({ description: '用户ID', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ 
    description: '交易类型',
    enum: ['recharge', 'withdraw', 'payment', 'refund', 'exchange'],
    required: false
  })
  @IsOptional()
  @IsEnum(['recharge', 'withdraw', 'payment', 'refund', 'exchange'])
  type?: string;

  @ApiProperty({ description: '开始时间', required: false })
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ description: '结束时间', required: false })
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ description: '页码', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页条数', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}