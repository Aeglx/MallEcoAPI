import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsIn, Min, Max } from 'class-validator';

export class SearchProductDto {
  @ApiProperty({ description: '搜索关键词', example: '手机' })
  @IsString()
  keyword: string;

  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', example: 10, default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @ApiPropertyOptional({ description: '分类ID', example: '1' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: '品牌ID', example: '1' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ description: '最低价格', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: '最高价格', example: 10000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: '是否新品', example: 1 })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  isNew?: number;

  @ApiPropertyOptional({ description: '是否热门', example: 1 })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  isHot?: number;

  @ApiPropertyOptional({ description: '是否推荐', example: 1 })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  recommend?: number;

  @ApiPropertyOptional({ 
    description: '排序字段', 
    example: 'price',
    enum: ['price', 'sale_num', 'create_time', 'update_time'] 
  })
  @IsOptional()
  @IsString()
  @IsIn(['price', 'sale_num', 'create_time', 'update_time'])
  sortBy?: string;

  @ApiPropertyOptional({ 
    description: '排序顺序', 
    example: 'desc',
    enum: ['asc', 'desc'] 
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class SearchProductResponseDto {
  @ApiProperty({ description: '商品列表' })
  products: any[];

  @ApiProperty({ description: '总数量' })
  total: number;

  @ApiProperty({ description: '当前页码' })
  page: number;

  @ApiProperty({ description: '每页数量' })
  pageSize: number;

  @ApiProperty({ description: '总页数' })
  totalPages: number;
}