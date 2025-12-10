import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateArticleCategoryDto {
  @ApiProperty({ description: '分类名称', example: '电商运营' })
  @IsString()
  name: string;

  @ApiProperty({ description: '分类描述', example: '电商运营相关文章', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '父级分类ID', example: 0, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  parentId?: number = 0;

  @ApiProperty({ description: '排序权重', example: 0, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sortWeight?: number = 0;

  @ApiProperty({ description: '是否启用', example: true, required: false })
  @IsOptional()
  isEnabled?: boolean = true;

  @ApiProperty({ description: '图标', example: 'icon-category', required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: '封面图片', example: 'https://example.com/category.jpg', required: false })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiProperty({ description: 'SEO标题', example: '电商运营文章分类', required: false })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiProperty({ description: 'SEO关键词', example: '电商,运营,文章', required: false })
  @IsString()
  @IsOptional()
  seoKeywords?: string;

  @ApiProperty({ description: 'SEO描述', example: '电商运营相关文章分类', required: false })
  @IsString()
  @IsOptional()
  seoDescription?: string;
}