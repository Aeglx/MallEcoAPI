import { IsNotEmpty, IsString, IsOptional, IsNumber, IsUrl, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum H5PageStatus {
  DRAFT = 0, // 草稿
  PUBLISHED = 1, // 已发布
  DISABLED = 2, // 已禁用
}

export class CreateH5PageDto {
  @ApiProperty({ description: '页面标题' })
  @IsNotEmpty({ message: '页面标题不能为空' })
  @IsString({ message: '页面标题必须是字符串' })
  title: string;

  @ApiProperty({ description: '页面描述', required: false })
  @IsOptional()
  @IsString({ message: '页面描述必须是字符串' })
  description?: string;

  @ApiProperty({ description: '页面内容' })
  @IsNotEmpty({ message: '页面内容不能为空' })
  @IsString({ message: '页面内容必须是字符串' })
  content: string;

  @ApiProperty({ description: '页面链接', required: false })
  @IsOptional()
  @IsUrl({}, { message: '页面链接格式不正确' })
  url?: string;

  @ApiProperty({ description: '页面封面图', required: false })
  @IsOptional()
  @IsString({ message: '页面封面图必须是字符串' })
  coverImage?: string;

  @ApiProperty({ description: '页面状态', enum: H5PageStatus, default: H5PageStatus.DRAFT })
  @IsOptional()
  @IsEnum(H5PageStatus, { message: '页面状态格式不正确' })
  status?: H5PageStatus;

  @ApiProperty({ description: '排序权重', required: false })
  @IsOptional()
  @IsNumber({}, { message: '排序权重必须是数字' })
  sortOrder?: number;

  @ApiProperty({ description: '是否启用微信分享', required: false })
  @IsOptional()
  enableShare?: boolean;

  @ApiProperty({ description: '分享标题', required: false })
  @IsOptional()
  @IsString({ message: '分享标题必须是字符串' })
  shareTitle?: string;

  @ApiProperty({ description: '分享描述', required: false })
  @IsOptional()
  @IsString({ message: '分享描述必须是字符串' })
  shareDescription?: string;

  @ApiProperty({ description: '分享图标', required: false })
  @IsOptional()
  @IsString({ message: '分享图标必须是字符串' })
  shareImage?: string;
}
