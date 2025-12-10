import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 拼团商品DTO
 */
export class GroupBuyGoodsDto {
  @ApiProperty({ description: '商品ID' })
  @IsNotEmpty({ message: '商品ID不能为空' })
  @IsString({ message: '商品ID必须是字符串' })
  productId: string;

  @ApiProperty({ description: '拼团价' })
  @IsNotEmpty({ message: '拼团价不能为空' })
  @IsNumber({}, { message: '拼团价必须是数字' })
  groupBuyPrice: number;

  @ApiProperty({ description: '成团人数' })
  @IsNotEmpty({ message: '成团人数不能为空' })
  @IsNumber({}, { message: '成团人数必须是数字' })
  groupCount: number;

  @ApiProperty({ description: '库存' })
  @IsOptional()
  @IsNumber({}, { message: '库存必须是数字' })
  stock: number;

  @ApiProperty({ description: '排序' })
  @IsOptional()
  @IsNumber({}, { message: '排序必须是数字' })
  sortOrder: number;

  @ApiProperty({ description: '备注' })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark: string;
}

/**
 * 创建拼团活动DTO
 */
export class GroupBuyCreateDto {
  @ApiProperty({ description: '活动名称' })
  @IsNotEmpty({ message: '活动名称不能为空' })
  @IsString({ message: '活动名称必须是字符串' })
  name: string;

  @ApiProperty({ description: '活动开始时间' })
  @IsNotEmpty({ message: '活动开始时间不能为空' })
  startTime: Date;

  @ApiProperty({ description: '活动结束时间' })
  @IsNotEmpty({ message: '活动结束时间不能为空' })
  endTime: Date;

  @ApiProperty({ description: '有效时长（小时）' })
  @IsOptional()
  @IsNumber({}, { message: '有效时长必须是数字' })
  validHours: number;

  @ApiProperty({ description: '每人限购数量 0表示不限制' })
  @IsOptional()
  @IsNumber({}, { message: '每人限购数量必须是数字' })
  limitCount: number;

  @ApiProperty({ description: '活动描述' })
  @IsOptional()
  @IsString({ message: '活动描述必须是字符串' })
  description: string;

  @ApiProperty({ description: '分享标题' })
  @IsOptional()
  @IsString({ message: '分享标题必须是字符串' })
  shareTitle: string;

  @ApiProperty({ description: '分享图片' })
  @IsOptional()
  @IsString({ message: '分享图片必须是字符串' })
  shareImage: string;

  @ApiProperty({ description: '分享描述' })
  @IsOptional()
  @IsString({ message: '分享描述必须是字符串' })
  shareDescription: string;

  @ApiProperty({ description: '备注' })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark: string;

  @ApiProperty({ description: '拼团商品列表', type: [GroupBuyGoodsDto] })
  @IsNotEmpty({ message: '拼团商品列表不能为空' })
  @IsArray({ message: '拼团商品列表必须是数组' })
  @ValidateNested({ each: true })
  @Type(() => GroupBuyGoodsDto)
  goods: GroupBuyGoodsDto[];
}