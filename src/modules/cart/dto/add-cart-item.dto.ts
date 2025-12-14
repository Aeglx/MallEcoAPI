import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsObject } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({
    description: '商品ID',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: '商品数量',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: '商品价格',
    example: 99.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: '商品折扣',
    example: 0,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiProperty({
    description: '商品名称',
    example: '测试商品',
    required: false,
  })
  @IsString()
  @IsOptional()
  productName?: string;

  @ApiProperty({
    description: '商品图片',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  productImage?: string;

  @ApiProperty({
    description: '商品属性',
    example: { color: 'red', size: 'M' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  productAttributes?: Record<string, any>;
}
