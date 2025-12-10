import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class DistributionGoodsSearchParams {
  @ApiProperty({ description: '店铺ID', required: false })
  @IsString()
  @IsOptional()
  storeId?: string;

  @ApiProperty({ description: '商品名称', required: false })
  @IsString()
  @IsOptional()
  goodsName?: string;

  @ApiProperty({ description: '商品ID', required: false })
  @IsString()
  @IsOptional()
  goodsId?: string;

  @ApiProperty({ description: '规格ID', required: false })
  @IsString()
  @IsOptional()
  skuId?: string;

  @ApiProperty({ description: '最低佣金', required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minCommission?: number;

  @ApiProperty({ description: '最高佣金', required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxCommission?: number;

  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty({ description: '每页大小', required: false, default: 10 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  pageSize?: number = 10;
}