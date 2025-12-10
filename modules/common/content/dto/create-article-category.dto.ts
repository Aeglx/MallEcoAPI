import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleCategoryDto {
  @ApiProperty({ description: '分类名称', example: '电商运营' })
  @IsNotEmpty({ message: '分类名称不能为空' })
  @IsString({ message: '分类名称必须是字符串' })
  name: string;

  @ApiProperty({ description: '分类描述', example: '电商运营相关知识', required: false })
  @IsOptional()
  @IsString({ message: '分类描述必须是字符串' })
  description?: string;

  @ApiProperty({ description: '父分类ID', example: 0, required: false })
  @IsOptional()
  @IsNumber({}, { message: '父分类ID必须是数字' })
  parentId?: number;

  @ApiProperty({ description: '排序顺序', example: 0, required: false })
  @IsOptional()
  @IsNumber({}, { message: '排序顺序必须是数字' })
  sortOrder?: number;

  @ApiProperty({ description: '是否激活', example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: '是否激活必须是布尔值' })
  isActive?: boolean;

  @ApiProperty({ description: '分类图标', example: 'icon-shop', required: false })
  @IsOptional()
  @IsString({ message: '分类图标必须是字符串' })
  icon?: string;
}