import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleTagDto {
  @ApiProperty({ description: '标签名称', example: '电商' })
  @IsNotEmpty({ message: '标签名称不能为空' })
  @IsString({ message: '标签名称必须是字符串' })
  name: string;

  @ApiProperty({ description: '标签描述', example: '电商相关文章', required: false })
  @IsOptional()
  @IsString({ message: '标签描述必须是字符串' })
  description?: string;
}