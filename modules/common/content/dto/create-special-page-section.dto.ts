import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSpecialPageSectionDto {
  @ApiProperty({ description: '区块标题', example: '热销商品推荐' })
  @IsNotEmpty({ message: '区块标题不能为空' })
  @IsString({ message: '区块标题必须是字符串' })
  title: string;

  @ApiProperty({ description: '区块内容', example: '这里是区块内容...', required: false })
  @IsOptional()
  @IsString({ message: '区块内容必须是字符串' })
  content?: string;

  @ApiProperty({ description: '区块图片', example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsString({ message: '区块图片必须是字符串' })
  image?: string;

  @ApiProperty({ description: '区块类型', enum: ['banner', 'product', 'article', 'video', 'custom'], example: 'banner' })
  @IsNotEmpty({ message: '区块类型不能为空' })
  @IsString({ message: '区块类型必须是字符串' })
  sectionType: string;

  @ApiProperty({ description: '区块配置', example: { backgroundColor: '#ffffff' }, required: false })
  @IsOptional()
  @IsObject({ message: '区块配置必须是对象' })
  config?: any;

  @ApiProperty({ description: '排序顺序', example: 0, required: false })
  @IsOptional()
  @IsNumber({}, { message: '排序顺序必须是数字' })
  sortOrder?: number;

  @ApiProperty({ description: '是否激活', example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: '是否激活必须是布尔值' })
  isActive?: boolean;
}