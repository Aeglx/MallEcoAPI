import { IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCouponDto {
  @ApiProperty({ description: '优惠券名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '优惠券描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '折扣金额', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiProperty({ description: '折扣率', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  discountRate?: number;

  @ApiProperty({ description: '最低消费金额', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiProperty({ description: '最高优惠金额', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiProperty({ description: '最大领取数量', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxClaimCount?: number;

  @ApiProperty({ description: '开始时间', required: false })
  @IsOptional()
  startTime?: Date;

  @ApiProperty({ description: '结束时间', required: false })
  @IsOptional()
  endTime?: Date;

  @ApiProperty({ 
    description: '状态',
    enum: ['active', 'inactive', 'expired'],
    required: false
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'expired'])
  status?: string;

  @ApiProperty({ description: '使用规则', required: false })
  @IsOptional()
  rules?: any;
}