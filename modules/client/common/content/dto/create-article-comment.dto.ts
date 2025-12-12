import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleCommentDto {
  @ApiProperty({ description: '评论内容', example: '这篇文章很有帮助' })
  @IsNotEmpty({ message: '评论内容不能为空' })
  @IsString({ message: '评论内容必须是字符串' })
  content: string;

  @ApiProperty({ description: '父评论ID', example: 0, required: false })
  @IsOptional()
  @IsNumber({}, { message: '父评论ID必须是数字' })
  parentId?: number;

  @ApiProperty({ description: '用户ID', example: 1, required: false })
  @IsOptional()
  @IsNumber({}, { message: '用户ID必须是数字' })
  userId?: number;

  @ApiProperty({ description: '用户名称', example: '张三', required: false })
  @IsOptional()
  @IsString({ message: '用户名称必须是字符串' })
  userName?: string;

  @ApiProperty({ description: '用户头像', example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsString({ message: '用户头像必须是字符串' })
  userAvatar?: string;

  @ApiProperty({ description: '文章ID', example: 1 })
  @IsNotEmpty({ message: '文章ID不能为空' })
  @IsNumber({}, { message: '文章ID必须是数字' })
  articleId: number;
}