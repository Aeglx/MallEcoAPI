import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateArticleDto {
  @ApiProperty({ description: '文章标题', example: '如何提高电商转化率', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: '文章副标题', example: '实用技巧分享', required: false })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiProperty({ description: '文章内容', example: '<p>文章内容...</p>', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ description: '文章摘要', example: '本文分享提高电商转化率的实用技巧', required: false })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiProperty({ description: '封面图片', example: 'https://example.com/cover.jpg', required: false })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiProperty({ description: '分类ID', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  categoryId?: number;

  @ApiProperty({ description: '标签ID列表', example: [1, 2, 3], required: false })
  @IsArray()
  @IsOptional()
  tagIds?: number[];

  @ApiProperty({ description: '作者', example: '管理员', required: false })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({ description: '来源', example: '原创', required: false })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ description: 'SEO标题', example: '提高电商转化率技巧', required: false })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiProperty({ description: 'SEO关键词', example: '电商,转化率,技巧', required: false })
  @IsString()
  @IsOptional()
  seoKeywords?: string;

  @ApiProperty({ description: 'SEO描述', example: '分享提高电商转化率的实用技巧', required: false })
  @IsString()
  @IsOptional()
  seoDescription?: string;

  @ApiProperty({ description: '是否允许评论', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  allowComment?: boolean;

  @ApiProperty({ description: '排序权重', example: 0, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sortWeight?: number;

  @ApiProperty({ description: '状态', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  status?: number;
}