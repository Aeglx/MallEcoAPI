import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CouponType {
  DISCOUNT = 'discount', // 折扣券
  CASH = 'cash', // 代金券
  GIFT = 'gift', // 礼品券
  GROUPON = 'groupon', // 团购券
  GENERAL = 'general', // 通用券
}

export enum CouponStatus {
  DRAFT = 0, // 草稿
  ACTIVE = 1, // 已激活
  DISABLED = 2, // 已禁用
  EXPIRED = 3, // 已过期
}

export class CreateCouponDto {
  @ApiProperty({ description: '卡券标题' })
  @IsNotEmpty({ message: '卡券标题不能为空' })
  @IsString({ message: '卡券标题必须是字符串' })
  title: string;

  @ApiProperty({ description: '卡券类型', enum: CouponType })
  @IsNotEmpty({ message: '卡券类型不能为空' })
  @IsEnum(CouponType, { message: '卡券类型格式不正确' })
  couponType: CouponType;

  @ApiProperty({ description: '卡券面值', required: false })
  @IsOptional()
  @IsNumber({}, { message: '卡券面值必须是数字' })
  @Min(0, { message: '卡券面值不能小于0' })
  value?: number;

  @ApiProperty({ description: '折扣比例(0-100)', required: false })
  @IsOptional()
  @IsNumber({}, { message: '折扣比例必须是数字' })
  @Min(0, { message: '折扣比例不能小于0' })
  @Max(100, { message: '折扣比例不能大于100' })
  discountRate?: number;

  @ApiProperty({ description: '最低消费金额', required: false })
  @IsOptional()
  @IsNumber({}, { message: '最低消费金额必须是数字' })
  @Min(0, { message: '最低消费金额不能小于0' })
  minAmount?: number;

  @ApiProperty({ description: '卡券数量' })
  @IsNotEmpty({ message: '卡券数量不能为空' })
  @IsNumber({}, { message: '卡券数量必须是数字' })
  @Min(1, { message: '卡券数量不能小于1' })
  quantity: number;

  @ApiProperty({ description: '每人限领数量', required: false })
  @IsOptional()
  @IsNumber({}, { message: '每人限领数量必须是数字' })
  @Min(1, { message: '每人限领数量不能小于1' })
  limitPerUser?: number;

  @ApiProperty({ description: '开始时间' })
  @IsNotEmpty({ message: '开始时间不能为空' })
  @IsDateString({}, { message: '开始时间格式不正确' })
  startTime: string;

  @ApiProperty({ description: '结束时间' })
  @IsNotEmpty({ message: '结束时间不能为空' })
  @IsDateString({}, { message: '结束时间格式不正确' })
  endTime: string;

  @ApiProperty({ description: '卡券描述', required: false })
  @IsOptional()
  @IsString({ message: '卡券描述必须是字符串' })
  description?: string;

  @ApiProperty({ description: '使用说明', required: false })
  @IsOptional()
  @IsString({ message: '使用说明必须是字符串' })
  instructions?: string;

  @ApiProperty({ description: '卡券图片', required: false })
  @IsOptional()
  @IsString({ message: '卡券图片必须是字符串' })
  image?: string;

  @ApiProperty({ description: '卡券状态', enum: CouponStatus, default: CouponStatus.DRAFT })
  @IsOptional()
  @IsEnum(CouponStatus, { message: '卡券状态格式不正确' })
  status?: CouponStatus;
}