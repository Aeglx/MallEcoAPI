import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, MaxLength, Min, Max } from 'class-validator';

export enum DistributionType {
  RATE = 0,    // 按比例
  AMOUNT = 1,  // 按金额
}

export class DistributionGoodsCreateDto {
  @ApiProperty({ description: '商品ID' })
  @IsNotEmpty({ message: '商品ID不能为空' })
  productId: string;

  @ApiProperty({ description: '分销类型', enum: DistributionType })
  @IsNotEmpty({ message: '分销类型不能为空' })
  @IsEnum(DistributionType)
  distributionType: DistributionType;

  @ApiProperty({ description: '分销金额' })
  @IsNotEmpty({ message: '分销金额不能为空' })
  @IsNumber({}, { message: '分销金额必须是数字' })
  @Min(0, { message: '分销金额不能为负数' })
  distributionAmount: number;

  @ApiProperty({ description: '分销比例(%)', required: false })
  @IsOptional()
  @IsNumber({}, { message: '分销比例必须是数字' })
  @Min(0, { message: '分销比例不能为负数' })
  @Max(100, { message: '分销比例不能超过100' })
  distributionRate?: number;

  @ApiProperty({ description: '一级佣金比例(%)' })
  @IsNotEmpty({ message: '一级佣金比例不能为空' })
  @IsNumber({}, { message: '一级佣金比例必须是数字' })
  @Min(0, { message: '一级佣金比例不能为负数' })
  @Max(100, { message: '一级佣金比例不能超过100' })
  level1Commission: number;

  @ApiProperty({ description: '二级佣金比例(%)', required: false })
  @IsOptional()
  @IsNumber({}, { message: '二级佣金比例必须是数字' })
  @Min(0, { message: '二级佣金比例不能为负数' })
  @Max(100, { message: '二级佣金比例不能超过100' })
  level2Commission?: number;

  @ApiProperty({ description: '三级佣金比例(%)', required: false })
  @IsOptional()
  @IsNumber({}, { message: '三级佣金比例必须是数字' })
  @Min(0, { message: '三级佣金比例不能为负数' })
  @Max(100, { message: '三级佣金比例不能超过100' })
  level3Commission?: number;

  @ApiProperty({ description: '自购佣金比例(%)', required: false })
  @IsOptional()
  @IsNumber({}, { message: '自购佣金比例必须是数字' })
  @Min(0, { message: '自购佣金比例不能为负数' })
  @Max(100, { message: '自购佣金比例不能超过100' })
  selfCommission?: number;

  @ApiProperty({ description: '最低佣金', required: false })
  @IsOptional()
  @IsNumber({}, { message: '最低佣金必须是数字' })
  @Min(0, { message: '最低佣金不能为负数' })
  minCommission?: number;

  @ApiProperty({ description: '最高佣金', required: false })
  @IsOptional()
  @IsNumber({}, { message: '最高佣金必须是数字' })
  @Min(0, { message: '最高佣金不能为负数' })
  maxCommission?: number;

  @ApiProperty({ description: '开始时间', required: false })
  @IsOptional()
  startTime?: Date;

  @ApiProperty({ description: '结束时间', required: false })
  @IsOptional()
  endTime?: Date;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsNumber({}, { message: '排序必须是数字' })
  sortOrder?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  @MaxLength(500, { message: '备注不能超过500字' })
  remark?: string;
}