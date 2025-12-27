import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MenuKeywordStatus {
  DRAFT = 0, // 草稿
  ACTIVE = 1, // 已激活
  DISABLED = 2, // 已禁用
}

export class CreateMenuKeywordDto {
  @ApiProperty({ description: '关键词' })
  @IsNotEmpty({ message: '关键词不能为空' })
  @IsString({ message: '关键词必须是字符串' })
  keyword: string;

  @ApiProperty({ description: '关联菜单ID' })
  @IsNotEmpty({ message: '关联菜单ID不能为空' })
  @IsNumber({}, { message: '关联菜单ID必须是数字' })
  menuId: number;

  @ApiProperty({ description: '关键词类型', required: false })
  @IsOptional()
  @IsString({ message: '关键词类型必须是字符串' })
  keywordType?: string;

  @ApiProperty({
    description: '关键词状态',
    enum: MenuKeywordStatus,
    default: MenuKeywordStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(MenuKeywordStatus, { message: '关键词状态格式不正确' })
  status?: MenuKeywordStatus;

  @ApiProperty({ description: '排序权重', required: false })
  @IsOptional()
  @IsNumber({}, { message: '排序权重必须是数字' })
  sortOrder?: number;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  enabled?: boolean = true;

  @ApiProperty({ description: '关键词描述', required: false })
  @IsOptional()
  @IsString({ message: '关键词描述必须是字符串' })
  description?: string;
}
