import { IsOptional, IsString, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateArticleCommentDto {
  @ApiProperty({ description: '评论内容', example: '这篇文章很有帮助', required: false })
  @IsOptional()
  @IsString({ message: '评论内容必须是字符串' })
  content?: string;

  @ApiProperty({ description: '评论状态', enum: ['pending', 'approved', 'rejected'], example: 'approved', required: false })
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected'], { message: '评论状态必须是 pending、approved 或 rejected' })
  status?: string;

  @ApiProperty({ description: '是否置顶', example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: '是否置顶必须是布尔值' })
  isTop?: boolean;
}