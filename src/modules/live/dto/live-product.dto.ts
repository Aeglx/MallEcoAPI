import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLiveProductDto {
  @IsNotEmpty({ message: '直播ID不能为空' })
  @IsString({ message: '直播ID必须是字符串' })
  @ApiProperty({ name: 'liveId', description: '直播ID', example: '1234567890abcdef12345678', required: true })
  liveId: string;

  @IsNotEmpty({ message: '商品ID不能为空' })
  @IsString({ message: '商品ID必须是字符串' })
  @ApiProperty({ name: 'productId', description: '商品ID', example: '1234567890abcdef12345678', required: true })
  productId: string;

  @IsOptional()
  @IsNumber({}, { message: '排序必须是数字' })
  @ApiProperty({ name: 'sortOrder', description: '排序', example: 0, required: false })
  sortOrder: number;

  @IsNotEmpty({ message: '直播价格不能为空' })
  @IsNumber({}, { message: '直播价格必须是数字' })
  @ApiProperty({ name: 'livePrice', description: '直播价格', example: 99.99, required: true })
  livePrice: number;

  @IsNotEmpty({ message: '原价不能为空' })
  @IsNumber({}, { message: '原价必须是数字' })
  @ApiProperty({ name: 'originalPrice', description: '原价', example: 199.99, required: true })
  originalPrice: number;

  @IsNotEmpty({ message: '直播间库存不能为空' })
  @IsNumber({}, { message: '直播间库存必须是数字' })
  @ApiProperty({ name: 'stock', description: '直播间库存', example: 1000, required: true })
  stock: number;

  @IsOptional()
  @IsNumber({}, { message: '是否为直播热品必须是数字' })
  @ApiProperty({ name: 'isHot', description: '是否为直播热品', example: 0, required: false })
  isHot: number;
}

export class UpdateLiveProductDto {
  @IsOptional()
  @IsNumber({}, { message: '排序必须是数字' })
  @ApiProperty({ name: 'sortOrder', description: '排序', example: 0, required: false })
  sortOrder?: number;

  @IsOptional()
  @IsNumber({}, { message: '直播价格必须是数字' })
  @ApiProperty({ name: 'livePrice', description: '直播价格', example: 99.99, required: false })
  livePrice?: number;

  @IsOptional()
  @IsNumber({}, { message: '原价必须是数字' })
  @ApiProperty({ name: 'originalPrice', description: '原价', example: 199.99, required: false })
  originalPrice?: number;

  @IsOptional()
  @IsNumber({}, { message: '直播间库存必须是数字' })
  @ApiProperty({ name: 'stock', description: '直播间库存', example: 1000, required: false })
  stock?: number;

  @IsOptional()
  @IsNumber({}, { message: '是否为直播热品必须是数字' })
  @ApiProperty({ name: 'isHot', description: '是否为直播热品', example: 0, required: false })
  isHot?: number;
}
