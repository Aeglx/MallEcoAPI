import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MenuKeywordStatus } from './create-menu-keyword.dto';

export class QueryMenuKeywordDto {
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

  @ApiProperty({ description: '关键词', required: false })
  @IsOptional()
  @IsString({ message: '关键词必须是字符串' })
  keyword?: string;

  @ApiProperty({ description: '关联菜单ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '关联菜单ID必须是数字' })
  menuId?: number;

  @ApiProperty({ description: '关键词状态', enum: MenuKeywordStatus, required: false })
  @IsOptional()
  @IsEnum(MenuKeywordStatus, { message: '关键词状态格式不正确' })
  status?: MenuKeywordStatus;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  enabled?: boolean;
}