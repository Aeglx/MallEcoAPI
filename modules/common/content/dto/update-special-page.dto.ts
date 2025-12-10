import { IsOptional, IsString, IsEnum, IsBoolean, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSpecialPageDto {
  @ApiProperty({ description: '专题页面标题', example: '双十一大促专题', required: false })
  @IsOptional()
  @IsString({ message: '专题页面标题必须是字符串' })
  title?: string;

  @ApiProperty({ description: '专题页面描述', example: '双十一大促活动专题页面', required: false })
  @IsOptional()
  @IsString({ message: '专题页面描述必须是字符串' })
  description?: string;

  @ApiProperty({ description: '封面图片', example: 'https://example.com/cover.jpg', required: false })
  @IsOptional()
  @IsString({ message: '封面图片必须是字符串' })
  coverImage?: string;

  @ApiProperty({ description: '专题页面状态', enum: ['draft', 'published', 'archived'], example: 'published', required: false })
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'], { message: '专题页面状态必须是 draft、published 或 archived' })
  status?: string;

  @ApiProperty({ description: '是否置顶', example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: '是否置顶必须是布尔值' })
  isTop?: boolean;

  @ApiProperty({ description: '是否推荐', example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: '是否推荐必须是布尔值' })
  isRecommend?: boolean;

  @ApiProperty({ description: '模板类型', example: 'promotion', required: false })
  @IsOptional()
  @IsString({ message: '模板类型必须是字符串' })
  templateType?: string;

  @ApiProperty({ description: 'SEO配置', example: { title: '双十一大促', keywords: '双十一,大促,优惠', description: '双十一大促活动' }, required: false })
  @IsOptional()
  @IsObject({ message: 'SEO配置必须是对象' })
  seoConfig?: any;

  @ApiProperty({ description: '样式配置', example: { backgroundColor: '#ffffff', textColor: '#333333' }, required: false })
  @IsOptional()
  @IsObject({ message: '样式配置必须是对象' })
  styleConfig?: any;

  @ApiProperty({ description: '发布时间', example: '2024-11-11T00:00:00Z', required: false })
  @IsOptional()
  @Type(() => Date)
  publishedAt?: Date;
}