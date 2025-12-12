import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLiveGoodsDto {
  @ApiProperty({ description: '直播间ID', example: 'room123' })
  @IsNotEmpty({ message: '直播间ID不能为空' })
  @IsString({ message: '直播间ID必须是字符串' })
  liveRoomId: string;

  @ApiProperty({ description: '商品ID', example: 'goods456' })
  @IsNotEmpty({ message: '商品ID不能为空' })
  @IsString({ message: '商品ID必须是字符串' })
  goodsId: string;

  @ApiProperty({ description: '商品名称', example: 'iPhone 15 Pro' })
  @IsNotEmpty({ message: '商品名称不能为空' })
  @IsString({ message: '商品名称必须是字符串' })
  goodsName: string;

  @ApiProperty({ description: '商品原价', example: 7999 })
  @IsNotEmpty({ message: '商品原价不能为空' })
  @IsNumber({}, { message: '商品原价必须是数字' })
  originalPrice: number;

  @ApiProperty({ description: '直播价格', example: 6999 })
  @IsNotEmpty({ message: '直播价格不能为空' })
  @IsNumber({}, { message: '直播价格必须是数字' })
  livePrice: number;

  @ApiProperty({ description: '直播库存', example: 100 })
  @IsNotEmpty({ message: '直播库存不能为空' })
  @IsNumber({}, { message: '直播库存必须是数字' })
  liveStock: number;

  @ApiProperty({ description: '排序权重', example: 0, required: false })
  @IsOptional()
  @IsNumber({}, { message: '排序权重必须是数字' })
  sortWeight?: number;

  @ApiProperty({ description: '是否上架', example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: '是否上架必须是布尔值' })
  isOnSale?: boolean;

  @ApiProperty({ description: '是否主推商品', example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: '是否主推商品必须是布尔值' })
  isMainGoods?: boolean;

  @ApiProperty({ description: '商品描述', example: '最新款iPhone，性能强劲', required: false })
  @IsOptional()
  @IsString({ message: '商品描述必须是字符串' })
  description?: string;

  @ApiProperty({ description: '商品图片URL', example: 'https://example.com/iphone.jpg', required: false })
  @IsOptional()
  @IsString({ message: '商品图片URL必须是字符串' })
  imageUrl?: string;

  @ApiProperty({ description: '上架时间', example: '2024-11-11T20:00:00Z', required: false })
  @IsOptional()
  @Type(() => Date)
  onSaleTime?: Date;
}