import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MaterialType, MaterialStatus } from '../services/wechat-material.service';

export class CreateMaterialDto {
  @ApiProperty({ description: '素材标题' })
  @IsNotEmpty({ message: '素材标题不能为空' })
  @IsString({ message: '素材标题必须是字符串' })
  title: string;

  @ApiProperty({ description: '素材类型', enum: MaterialType })
  @IsNotEmpty({ message: '素材类型不能为空' })
  @IsEnum(MaterialType, { message: '素材类型格式不正确' })
  materialType: MaterialType;

  @ApiProperty({ description: '素材URL' })
  @IsNotEmpty({ message: '素材URL不能为空' })
  @IsUrl({}, { message: '素材URL格式不正确' })
  url: string;

  @ApiProperty({ description: '素材描述', required: false })
  @IsOptional()
  @IsString({ message: '素材描述必须是字符串' })
  description?: string;

  @ApiProperty({ description: '素材大小(字节)', required: false })
  @IsOptional()
  @IsNumber({}, { message: '素材大小必须是数字' })
  size?: number;

  @ApiProperty({ description: '素材格式', required: false })
  @IsOptional()
  @IsString({ message: '素材格式必须是字符串' })
  format?: string;

  @ApiProperty({ description: '素材宽度(像素)', required: false })
  @IsOptional()
  @IsNumber({}, { message: '素材宽度必须是数字' })
  width?: number;

  @ApiProperty({ description: '素材高度(像素)', required: false })
  @IsOptional()
  @IsNumber({}, { message: '素材高度必须是数字' })
  height?: number;

  @ApiProperty({ description: '素材时长(秒)', required: false })
  @IsOptional()
  @IsNumber({}, { message: '素材时长必须是数字' })
  duration?: number;

  @ApiProperty({ description: '素材状态', enum: MaterialStatus, default: MaterialStatus.DRAFT })
  @IsOptional()
  @IsEnum(MaterialStatus, { message: '素材状态格式不正确' })
  status?: MaterialStatus;

  @ApiProperty({ description: '排序权重', required: false })
  @IsOptional()
  @IsNumber({}, { message: '排序权重必须是数字' })
  sortOrder?: number;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  enabled?: boolean = true;

  @ApiProperty({ description: '图文素材内容(JSON格式)', required: false })
  @IsOptional()
  @IsString({ message: '图文素材内容必须是字符串' })
  content?: string;

  @ApiProperty({ description: '图文素材作者', required: false })
  @IsOptional()
  @IsString({ message: '图文素材作者必须是字符串' })
  author?: string;

  @ApiProperty({ description: '图文素材封面图', required: false })
  @IsOptional()
  @IsUrl({}, { message: '图文素材封面图URL格式不正确' })
  coverImage?: string;
}