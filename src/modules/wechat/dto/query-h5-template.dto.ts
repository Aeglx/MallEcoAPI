import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { H5TemplateCategory } from './create-h5-template.dto';

export class QueryH5TemplateDto {
  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '页码必须是数字' })
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '每页数量必须是数字' })
  pageSize?: number = 10;

  @ApiProperty({ description: '模板名称', required: false })
  @IsOptional()
  @IsString({ message: '模板名称必须是字符串' })
  name?: string;

  @ApiProperty({ description: '模板分类', enum: H5TemplateCategory, required: false })
  @IsOptional()
  @IsEnum(H5TemplateCategory, { message: '模板分类格式不正确' })
  category?: H5TemplateCategory;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  enabled?: boolean;
}
