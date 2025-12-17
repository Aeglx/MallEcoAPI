import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum H5TemplateCategory {
  PROMOTION = 'promotion', // 促销活动
  GAME = 'game', // 游戏互动
  SURVEY = 'survey', // 问卷调查
  INVITATION = 'invitation', // 邀请函
  OTHER = 'other', // 其他
}

export class CreateH5TemplateDto {
  @ApiProperty({ description: '模板名称' })
  @IsNotEmpty({ message: '模板名称不能为空' })
  @IsString({ message: '模板名称必须是字符串' })
  name: string;

  @ApiProperty({ description: '模板分类', enum: H5TemplateCategory })
  @IsNotEmpty({ message: '模板分类不能为空' })
  @IsEnum(H5TemplateCategory, { message: '模板分类格式不正确' })
  category: H5TemplateCategory;

  @ApiProperty({ description: '模板内容' })
  @IsNotEmpty({ message: '模板内容不能为空' })
  @IsString({ message: '模板内容必须是字符串' })
  content: string;

  @ApiProperty({ description: '模板预览图', required: false })
  @IsOptional()
  @IsString({ message: '模板预览图必须是字符串' })
  previewImage?: string;

  @ApiProperty({ description: '模板描述', required: false })
  @IsOptional()
  @IsString({ message: '模板描述必须是字符串' })
  description?: string;

  @ApiProperty({ description: '排序权重', required: false })
  @IsOptional()
  @IsNumber({}, { message: '排序权重必须是数字' })
  sortOrder?: number;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  enabled?: boolean = true;
}