import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateArticleTagDto {
  @ApiProperty({ description: '标签名称', example: '电商', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: '标签描述', example: '电商相关标签', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '标签颜色', example: '#FF0000', required: false })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ description: '排序权重', example: 0, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sortWeight?: number;

  @ApiProperty({ description: '是否启用', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @ApiProperty({ description: '图标', example: 'icon-tag', required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: '使用次数', example: 0, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  usageCount?: number;
}