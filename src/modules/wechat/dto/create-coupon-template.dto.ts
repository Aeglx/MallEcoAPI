import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CouponTemplateType {
  DISCOUNT = 'discount', // 折扣模板
  CASH = 'cash', // 代金模板
  GIFT = 'gift', // 礼品模板
  GROUPON = 'groupon', // 团购模板
  GENERAL = 'general', // 通用模板
}

export class CreateCouponTemplateDto {
  @ApiProperty({ description: '模板名称' })
  @IsNotEmpty({ message: '模板名称不能为空' })
  @IsString({ message: '模板名称必须是字符串' })
  name: string;

  @ApiProperty({ description: '模板类型', enum: CouponTemplateType })
  @IsNotEmpty({ message: '模板类型不能为空' })
  @IsEnum(CouponTemplateType, { message: '模板类型格式不正确' })
  templateType: CouponTemplateType;

  @ApiProperty({ description: '默认面值', required: false })
  @IsOptional()
  @IsNumber({}, { message: '默认面值必须是数字' })
  @Min(0, { message: '默认面值不能小于0' })
  defaultValue?: number;

  @ApiProperty({ description: '默认折扣比例(0-100)', required: false })
  @IsOptional()
  @IsNumber({}, { message: '默认折扣比例必须是数字' })
  @Min(0, { message: '默认折扣比例不能小于0' })
  @Max(100, { message: '默认折扣比例不能大于100' })
  defaultDiscountRate?: number;

  @ApiProperty({ description: '默认最低消费金额', required: false })
  @IsOptional()
  @IsNumber({}, { message: '默认最低消费金额必须是数字' })
  @Min(0, { message: '默认最低消费金额不能小于0' })
  defaultMinAmount?: number;

  @ApiProperty({ description: '默认有效期(天)', required: false })
  @IsOptional()
  @IsNumber({}, { message: '默认有效期必须是数字' })
  @Min(1, { message: '默认有效期不能小于1天' })
  defaultValidityDays?: number;

  @ApiProperty({ description: '模板描述', required: false })
  @IsOptional()
  @IsString({ message: '模板描述必须是字符串' })
  description?: string;

  @ApiProperty({ description: '模板内容(JSON格式)' })
  @IsNotEmpty({ message: '模板内容不能为空' })
  @IsString({ message: '模板内容必须是字符串' })
  content: string;

  @ApiProperty({ description: '模板预览图', required: false })
  @IsOptional()
  @IsString({ message: '模板预览图必须是字符串' })
  previewImage?: string;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  enabled?: boolean = true;

  @ApiProperty({ description: '排序权重', required: false })
  @IsOptional()
  @IsNumber({}, { message: '排序权重必须是数字' })
  sortOrder?: number;
}