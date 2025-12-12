import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CouponSearchDto {
  @ApiProperty({ description: '优惠券名称', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ 
    description: '优惠券类型',
    enum: ['discount', 'cash', 'shipping'],
    required: false
  })
  @IsOptional()
  @IsEnum(['discount', 'cash', 'shipping'])
  type?: string;

  @ApiProperty({ 
    description: '状态',
    enum: ['active', 'inactive', 'expired'],
    required: false
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'expired'])
  status?: string;

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