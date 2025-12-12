import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({ description: '文章标题', example: '如何提高电商转化率' })
  @IsNotEmpty({ message: '文章标题不能为空' })
  @IsString({ message: '文章标题必须是字符串' })
  title: string;

  @ApiProperty({ description: '文章内容', example: '这是文章内容...' })
  @IsNotEmpty({ message: '文章内容不能为空' })
  @IsString({ message: '文章内容必须是字符串' })
  content: string;

  @ApiProperty({ description: '文章摘要', example: '本文介绍提高电商转化率的方法', required: false })
  @IsOptional()
  @IsString({ message: '文章摘要必须是字符串' })
  summary?: string;

  @ApiProperty({ description: '封面图片', example: 'https://example.com/cover.jpg', required: false })
  @IsOptional()
  @IsUrl({}, { message: '封面图片必须是有效的URL' })
  coverImage?: string;

  @ApiProperty({ description: '文章状态', enum: ['draft', 'pending', 'published'], example: 'draft' })
  @IsEnum(['draft', 'pending', 'published'], { message: '文章状态必须是 draft、pending 或 published' })
  status: string;

  @ApiProperty({ description: '是否允许评论', example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: '是否允许评论必须是布尔值' })
  allowComment?: boolean;

  @ApiProperty({ description: '是否置顶', example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: '是否置顶必须是布尔值' })
  isTop?: boolean;

  @ApiProperty({ description: '是否推荐', example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: '是否推荐必须是布尔值' })
  isRecommend?: boolean;

  @ApiProperty({ description: '是否原创', example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: '是否原创必须是布尔值' })
  isOriginal?: boolean;

  @ApiProperty({ description: '作者ID', example: 1, required: false })
  @IsOptional()
  @IsNumber({}, { message: '作者ID必须是数字' })
  authorId?: number;

  @ApiProperty({ description: '作者名称', example: '张三', required: false })
  @IsOptional()
  @IsString({ message: '作者名称必须是字符串' })
  authorName?: string;

  @ApiProperty({ description: '文章来源', example: '原创', required: false })
  @IsOptional()
  @IsString({ message: '文章来源必须是字符串' })
  source?: string;

  @ApiProperty({ description: '来源链接', example: 'https://example.com', required: false })
  @IsOptional()
  @IsUrl({}, { message: '来源链接必须是有效的URL' })
  sourceUrl?: string;

  @ApiProperty({ description: '分类ID', example: 1, required: false })
  @IsOptional()
  @IsNumber({}, { message: '分类ID必须是数字' })
  categoryId?: number;

  @ApiProperty({ description: '标签ID列表', example: [1, 2, 3], required: false })
  @IsOptional()
  @IsArray({ message: '标签ID必须是数组' })
  @IsNumber({}, { each: true, message: '每个标签ID必须是数字' })
  tagIds?: number[];

  @ApiProperty({ description: '发布时间', example: '2024-12-10T10:00:00Z', required: false })
  @IsOptional()
  @Type(() => Date)
  publishedAt?: Date;
}