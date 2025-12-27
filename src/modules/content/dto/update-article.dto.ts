import { IsOptional, IsString, IsNumber, IsArray, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateArticleDto {
  @IsOptional()
  @IsString({ message: '文章标题必须是字符串' })
  @ApiProperty({ name: 'title', description: '文章标题', example: '测试文章标题', required: false })
  title?: string;

  @IsOptional()
  @IsString({ message: '文章副标题必须是字符串' })
  @ApiProperty({
    name: 'subTitle',
    description: '文章副标题',
    example: '测试文章副标题',
    required: false,
  })
  subTitle?: string;

  @IsOptional()
  @IsString({ message: '文章内容必须是字符串' })
  @ApiProperty({
    name: 'content',
    description: '文章内容',
    example: '<p>这是一篇测试文章</p>',
    required: false,
  })
  content?: string;

  @IsOptional()
  @IsString({ message: '文章摘要必须是字符串' })
  @ApiProperty({
    name: 'summary',
    description: '文章摘要',
    example: '这是文章摘要',
    required: false,
  })
  summary?: string;

  @IsOptional()
  @IsString({ message: '封面图片必须是字符串' })
  @ApiProperty({
    name: 'coverImage',
    description: '封面图片',
    example: 'https://example.com/cover.jpg',
    required: false,
  })
  coverImage?: string;

  @IsOptional()
  @IsString({ message: '作者必须是字符串' })
  @ApiProperty({ name: 'author', description: '作者', example: 'admin', required: false })
  author?: string;

  @IsOptional()
  @IsString({ message: '分类ID必须是字符串' })
  @ApiProperty({
    name: 'categoryId',
    description: '分类ID',
    example: '1234567890abcdef12345678',
    required: false,
  })
  categoryId?: string;

  @IsOptional()
  @IsArray({ message: '标签ID必须是数组' })
  @ApiProperty({
    name: 'tagIds',
    description: '标签ID数组',
    example: ['1234567890abcdef12345678', '1234567890abcdef12345679'],
    required: false,
  })
  tagIds?: string[];

  @IsOptional()
  @IsNumber({}, { message: '状态必须是数字' })
  @ApiProperty({
    name: 'status',
    description: '状态：0-草稿，1-已发布，2-已下架',
    example: 1,
    required: false,
  })
  status?: number;

  @IsOptional()
  @IsNumber({}, { message: '是否置顶必须是数字' })
  @ApiProperty({ name: 'isTop', description: '是否置顶', example: 0, required: false })
  isTop?: number;

  @IsOptional()
  @IsNumber({}, { message: '是否热门必须是数字' })
  @ApiProperty({ name: 'isHot', description: '是否热门', example: 0, required: false })
  isHot?: number;

  @IsOptional()
  @IsDateString({}, { message: '发布时间必须是有效的日期字符串' })
  @ApiProperty({
    name: 'publishTime',
    description: '发布时间',
    example: '2023-12-01 10:00:00',
    required: false,
  })
  publishTime?: Date;
}
