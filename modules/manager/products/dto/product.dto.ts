import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsDecimal } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: '产品名称',
    example: 'iPhone 14 Pro Max'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '产品描述',
    example: '苹果iPhone 14 Pro Max智能手机'
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: '产品价格',
    example: 9999.00
  })
  @IsDecimal({ decimal_digits: '2' })
  price: number;

  @ApiProperty({
    description: '产品库存',
    example: 100
  })
  @IsNumber()
  stock: number;

  @ApiProperty({
    description: '产品分类ID',
    example: 'uuid-of-category'
  })
  @IsString()
  categoryId: string;

  @ApiProperty({
    description: '产品品牌ID',
    example: 'uuid-of-brand'
  })
  @IsString()
  brandId: string;

  @ApiProperty({
    description: '产品图片',
    example: 'https://example.com/product.jpg'
  })
  @IsString()
  image: string;

  @ApiProperty({
    description: '产品状态',
    enum: ['draft', 'published', 'unpublished'],
    default: 'draft'
  })
  @IsOptional()
  @IsEnum(['draft', 'published', 'unpublished'])
  status?: string;

  @ApiProperty({
    description: '是否推荐',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  isRecommended?: number;

  @ApiProperty({
    description: '是否热卖',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  isHot?: number;
}

export class UpdateProductDto {
  @ApiProperty({
    description: '产品名称',
    example: 'iPhone 14 Pro Max',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: '产品描述',
    example: '苹果iPhone 14 Pro Max智能手机',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '产品价格',
    example: 9999.00,
    required: false
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  price?: number;

  @ApiProperty({
    description: '产品库存',
    example: 100,
    required: false
  })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty({
    description: '产品分类ID',
    example: 'uuid-of-category',
    required: false
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: '产品品牌ID',
    example: 'uuid-of-brand',
    required: false
  })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiProperty({
    description: '产品图片',
    example: 'https://example.com/product.jpg',
    required: false
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    description: '产品状态',
    enum: ['draft', 'published', 'unpublished'],
    required: false
  })
  @IsOptional()
  @IsEnum(['draft', 'published', 'unpublished'])
  status?: string;

  @ApiProperty({
    description: '是否推荐',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  isRecommended?: number;

  @ApiProperty({
    description: '是否热卖',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  isHot?: number;
}

export class QueryProductDto {
  @ApiProperty({
    description: '页码',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({
    description: '每页数量',
    example: 10,
    required: false
  })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiProperty({
    description: '产品名称',
    example: 'iPhone',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: '产品状态',
    enum: ['draft', 'published', 'unpublished'],
    required: false
  })
  @IsOptional()
  @IsEnum(['draft', 'published', 'unpublished'])
  status?: string;

  @ApiProperty({
    description: '产品分类ID',
    example: 'uuid-of-category',
    required: false
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: '产品品牌ID',
    example: 'uuid-of-brand',
    required: false
  })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiProperty({
    description: '是否推荐',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  isRecommended?: number;

  @ApiProperty({
    description: '是否热卖',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  isHot?: number;
}
