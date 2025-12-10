import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 秒杀商品DTO
 */
export class SeckillGoodsDto {
  @ApiProperty({ description: '商品ID' })
  @IsNotEmpty({ message: '商品ID不能为空' })
  @IsString({ message: '商品ID必须是字符串' })
  productId: string;

  @ApiProperty({ description: '秒杀价' })
  @IsNotEmpty({ message: '秒杀价不能为空' })
  @IsNumber({}, { message: '秒杀价必须是数字' })
  seckillPrice: number;

  @ApiProperty({ description: '秒杀库存' })
  @IsNotEmpty({ message: '秒杀库存不能为空' })
  @IsNumber({}, { message: '秒杀库存必须是数字' })
  seckillStock: number;

  @ApiProperty({ description: '每限购数量 0表示不限制' })
  @IsOptional()
  @IsNumber({}, { message: '每限购数量必须是数字' })
  limitCount: number;

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
 * 创建秒杀活动DTO
 */
export class SeckillCreateDto {
  @ApiProperty({ description: '活动名称' })
  @IsNotEmpty({ message: '活动名称不能为空' })
  @IsString({ message: '活动名称必须是字符串' })
  name: string;

  @ApiProperty({ description: '活动编码' })
  @IsOptional()
  @IsString({ message: '活动编码必须是字符串' })
  code: string;

  @ApiProperty({ description: '活动开始时间' })
  @IsNotEmpty({ message: '活动开始时间不能为空' })
  startTime: Date;

  @ApiProperty({ description: '活动结束时间' })
  @IsNotEmpty({ message: '活动结束时间不能为空' })
  endTime: Date;

  @ApiProperty({ description: '预告开始时间' })
  @IsOptional()
  previewStartTime: Date;

  @ApiProperty({ description: '预告结束时间' })
  @IsOptional()
  previewEndTime: Date;

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

  @ApiProperty({ description: '秒杀商品列表', type: [SeckillGoodsDto] })
  @IsNotEmpty({ message: '秒杀商品列表不能为空' })
  @IsArray({ message: '秒杀商品列表必须是数组' })
  @ValidateNested({ each: true })
  @Type(() => SeckillGoodsDto)
  goods: SeckillGoodsDto[];
}