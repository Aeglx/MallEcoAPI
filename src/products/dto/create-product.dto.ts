import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsPositive, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: '商品名称', example: '智能手机' })
  @IsNotEmpty({ message: '商品名称不能为空' })
  @IsString({ message: '商品名称必须是字符串' })
  name: string;

  @ApiProperty({ description: '商品描述', example: '高性能智能手机', required: false })
  @IsOptional()
  @IsString({ message: '商品描述必须是字符串' })
  description?: string;

  @ApiProperty({ description: '商品价格', example: 2999.00 })
  @IsNotEmpty({ message: '商品价格不能为空' })
  @IsNumber({}, { message: '商品价格必须是数字' })
  @IsPositive({ message: '商品价格必须大于0' })
  price: number;

  @ApiProperty({ description: '原价', example: 3999.00, required: false })
  @IsOptional()
  @IsNumber({}, { message: '原价必须是数字' })
  @IsPositive({ message: '原价必须大于0' })
  originalPrice?: number;

  @ApiProperty({ description: '库存数量', example: 100 })
  @IsNotEmpty({ message: '库存数量不能为空' })
  @IsNumber({}, { message: '库存数量必须是数字' })
  @IsPositive({ message: '库存数量必须大于0' })
  stock: number;

  @ApiProperty({ description: '销量', example: 50, default: 0 })
  @IsOptional()
  @IsNumber({}, { message: '销量必须是数字' })
  sales?: number;

  @ApiProperty({ description: '主图', example: 'https://example.com/smartphone.jpg', required: false })
  @IsOptional()
  @IsString({ message: '主图必须是字符串' })
  mainImage?: string;

  @ApiProperty({ description: '分类ID', example: '1' })
  @IsNotEmpty({ message: '分类ID不能为空' })
  @IsString({ message: '分类ID必须是字符串' })
  categoryId: string;

  @ApiProperty({ description: '品牌ID', example: '1', required: false })
  @IsOptional()
  @IsString({ message: '品牌ID必须是字符串' })
  brandId?: string;

  @ApiProperty({ description: '是否上架', example: true, default: true })
  @IsOptional()
  isShow?: boolean;

  @ApiProperty({ description: '是否新品', example: true, default: false })
  @IsOptional()
  isNew?: boolean;

  @ApiProperty({ description: '是否热门', example: true, default: false })
  @IsOptional()
  isHot?: boolean;

  @ApiProperty({ description: '排序', example: 100, default: 0 })
  @IsOptional()
  @IsNumber({}, { message: '排序必须是数字' })
  sortOrder?: number;

  @ApiProperty({ description: '规格参数', example: { color: ['红色', '蓝色'], storage: ['64GB', '128GB'] }, required: false })
  @IsOptional()
  specifications?: any;

  @ApiProperty({ description: '商品详情', example: '<p>商品详情HTML内容</p>', required: false })
  @IsOptional()
  @IsString({ message: '商品详情必须是字符串' })
  details?: string;
}
