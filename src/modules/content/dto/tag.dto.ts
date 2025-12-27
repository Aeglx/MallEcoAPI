import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @IsNotEmpty({ message: '标签名称不能为空' })
  @IsString({ message: '标签名称必须是字符串' })
  @ApiProperty({ name: 'tagName', description: '标签名称', example: '科技', required: true })
  tagName: string;

  @IsOptional()
  @IsString({ message: '标签别名必须是字符串' })
  @ApiProperty({ name: 'slug', description: '标签别名', example: 'technology', required: false })
  slug: string;

  @IsOptional()
  @IsString({ message: '标签描述必须是字符串' })
  @ApiProperty({
    name: 'description',
    description: '标签描述',
    example: '科技相关内容标签',
    required: false,
  })
  description: string;
}

export class UpdateTagDto {
  @IsOptional()
  @IsString({ message: '标签名称必须是字符串' })
  @ApiProperty({ name: 'tagName', description: '标签名称', example: '科技', required: false })
  tagName?: string;

  @IsOptional()
  @IsString({ message: '标签别名必须是字符串' })
  @ApiProperty({ name: 'slug', description: '标签别名', example: 'technology', required: false })
  slug?: string;

  @IsOptional()
  @IsString({ message: '标签描述必须是字符串' })
  @ApiProperty({
    name: 'description',
    description: '标签描述',
    example: '科技相关内容标签',
    required: false,
  })
  description?: string;
}
