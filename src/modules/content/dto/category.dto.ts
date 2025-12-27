import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @IsNotEmpty({ message: '分类名称不能为空' })
  @IsString({ message: '分类名称必须是字符串' })
  @ApiProperty({
    name: 'categoryName',
    description: '分类名称',
    example: '新闻资讯',
    required: true,
  })
  categoryName: string;

  @IsOptional()
  @IsString({ message: '父分类ID必须是字符串' })
  @ApiProperty({
    name: 'parentId',
    description: '父分类ID',
    example: '1234567890abcdef12345678',
    required: false,
  })
  parentId: string;

  @IsOptional()
  @IsNumber({}, { message: '排序必须是数字' })
  @ApiProperty({ name: 'sortOrder', description: '排序', example: 0, required: false })
  sortOrder: number;

  @IsOptional()
  @IsNumber({}, { message: '状态必须是数字' })
  @ApiProperty({ name: 'status', description: '状态：0-禁用，1-启用', example: 1, required: false })
  status: number;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: '分类名称必须是字符串' })
  @ApiProperty({
    name: 'categoryName',
    description: '分类名称',
    example: '新闻资讯',
    required: false,
  })
  categoryName?: string;

  @IsOptional()
  @IsString({ message: '父分类ID必须是字符串' })
  @ApiProperty({
    name: 'parentId',
    description: '父分类ID',
    example: '1234567890abcdef12345678',
    required: false,
  })
  parentId?: string;

  @IsOptional()
  @IsNumber({}, { message: '排序必须是数字' })
  @ApiProperty({ name: 'sortOrder', description: '排序', example: 0, required: false })
  sortOrder?: number;

  @IsOptional()
  @IsNumber({}, { message: '状态必须是数字' })
  @ApiProperty({ name: 'status', description: '状态：0-禁用，1-启用', example: 1, required: false })
  status?: number;
}
