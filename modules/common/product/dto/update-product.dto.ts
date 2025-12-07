import { IsOptional, IsString, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({
    description: '商品名称',
    example: 'MacBook Pro 14英寸',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: '商品描述',
    example: '最新款MacBook Pro，配备M3芯片',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '商品图片',
    example: 'https://example.com/product.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    description: '商品分类ID',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: '商品品牌ID',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiProperty({
    description: '商品原价',
    example: 14999,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @ApiProperty({
    description: '商品销售价',
    example: 13999,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sellingPrice?: number;

  @ApiProperty({
    description: '商品库存',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty({
    description: '商品销量',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sales?: number;

  @ApiProperty({
    description: '商品状态',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @ApiProperty({
    description: '商品是否上架',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isOnSale?: boolean;

  @ApiProperty({
    description: '商品排序',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sort?: number;

  @ApiProperty({
    description: '商品属性',
    example: { color: '深空灰色', memory: '16GB' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;
}
