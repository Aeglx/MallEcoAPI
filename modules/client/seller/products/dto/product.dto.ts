import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsObject } from 'class-validator';

// 创建商品DTO
export class CreateProductDto {
  @ApiProperty({ description: '商品名称', example: '智能手机' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: '商品分类ID', example: '1' })
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @ApiProperty({ description: '商品品牌ID', example: '1' })
  @IsNotEmpty()
  @IsString()
  brandId: string;

  @ApiProperty({ description: '商品原价', example: 2999 })
  @IsNotEmpty()
  @IsNumber()
  originalPrice: number;

  @ApiProperty({ description: '商品售价', example: 2799 })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({ description: '商品库存', example: 100 })
  @IsNotEmpty()
  @IsNumber()
  stock: number;

  @ApiProperty({ description: '商品主图', example: 'https://example.com/product.jpg' })
  @IsNotEmpty()
  @IsString()
  mainImage: string;

  @ApiProperty({ description: '商品描述', example: '高性能智能手机', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '商品关键字', example: '手机,智能,高性能', required: false })
  @IsOptional()
  @IsString()
  keywords?: string;

  @ApiProperty({ description: '商品详情', example: '<p>商品详情描述</p>', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: '商品图片画廊', example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'], required: false })
  @IsOptional()
  @IsArray()
  galleryImages?: string[];
}

// 更新商品DTO
export class UpdateProductDto {
  @ApiProperty({ description: '商品名称', example: '智能手机', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '商品分类ID', example: '1', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: '商品品牌ID', example: '1', required: false })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiProperty({ description: '商品原价', example: 2999, required: false })
  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @ApiProperty({ description: '商品售价', example: 2799, required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ description: '商品库存', example: 100, required: false })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty({ description: '商品主图', example: 'https://example.com/product.jpg', required: false })
  @IsOptional()
  @IsString()
  mainImage?: string;

  @ApiProperty({ description: '商品描述', example: '高性能智能手机', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '商品关键字', example: '手机,智能,高性能', required: false })
  @IsOptional()
  @IsString()
  keywords?: string;

  @ApiProperty({ description: '商品详情', example: '<p>商品详情描述</p>', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: '商品图片画廊', example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'], required: false })
  @IsOptional()
  @IsArray()
  galleryImages?: string[];

  @ApiProperty({ description: '是否新品', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  isNew?: number;

  @ApiProperty({ description: '是否热门', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  isHot?: number;

  @ApiProperty({ description: '是否推荐', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  isRecommend?: number;
}

// 查询商品DTO
export class QueryProductDto {
  @ApiProperty({ description: '商品名称', example: '手机', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '商品分类ID', example: '1', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: '是否上架', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  isShow?: number;

  @ApiProperty({ description: '页码', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ description: '每页条数', example: 10, required: false })
  @IsOptional()
  @IsNumber()
  pageSize?: number = 10;
}
