import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { DistributionOrderStatusEnum } from '../enums/distribution-order-status.enum';
import { Transform, Type } from 'class-transformer';

export class DistributionOrderSearchParams {
  @ApiProperty({ description: '分销员ID', required: false })
  @IsString()
  @IsOptional()
  distributionId?: string;

  @ApiProperty({ description: '购买会员ID', required: false })
  @IsString()
  @IsOptional()
  memberId?: string;

  @ApiProperty({ description: '订单编号', required: false })
  @IsString()
  @IsOptional()
  orderSn?: string;

  @ApiProperty({ description: '子订单编号', required: false })
  @IsString()
  @IsOptional()
  orderItemSn?: string;

  @ApiProperty({ 
    description: '分销订单状态', 
    enum: DistributionOrderStatusEnum,
    required: false 
  })
  @IsString()
  @IsOptional()
  distributionOrderStatus?: DistributionOrderStatusEnum;

  @ApiProperty({ description: '店铺ID', required: false })
  @IsString()
  @IsOptional()
  storeId?: string;

  @ApiProperty({ description: '商品ID', required: false })
  @IsString()
  @IsOptional()
  goodsId?: string;

  @ApiProperty({ description: '商品名称', required: false })
  @IsString()
  @IsOptional()
  goodsName?: string;

  @ApiProperty({ description: '开始时间', required: false })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiProperty({ description: '结束时间', required: false })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiProperty({ description: '最低提成金额', required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minRebate?: number;

  @ApiProperty({ description: '最高提成金额', required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxRebate?: number;

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