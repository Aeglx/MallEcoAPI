import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MenuType, MenuStatus } from '../services/wechat-menu.service';

export class CreateMenuDto {
  @ApiProperty({ description: '菜单名称' })
  @IsNotEmpty({ message: '菜单名称不能为空' })
  @IsString({ message: '菜单名称必须是字符串' })
  name: string;

  @ApiProperty({ description: '菜单类型', enum: MenuType })
  @IsNotEmpty({ message: '菜单类型不能为空' })
  @IsEnum(MenuType, { message: '菜单类型格式不正确' })
  menuType: MenuType;

  @ApiProperty({ description: '菜单键值(click类型必填)', required: false })
  @IsOptional()
  @IsString({ message: '菜单键值必须是字符串' })
  key?: string;

  @ApiProperty({ description: '菜单链接(view类型必填)', required: false })
  @IsOptional()
  @IsUrl({}, { message: '菜单链接格式不正确' })
  url?: string;

  @ApiProperty({ description: '小程序AppID', required: false })
  @IsOptional()
  @IsString({ message: '小程序AppID必须是字符串' })
  appId?: string;

  @ApiProperty({ description: '小程序页面路径', required: false })
  @IsOptional()
  @IsString({ message: '小程序页面路径必须是字符串' })
  pagePath?: string;

  @ApiProperty({ description: '素材ID', required: false })
  @IsOptional()
  @IsString({ message: '素材ID必须是字符串' })
  mediaId?: string;

  @ApiProperty({ description: '父菜单ID', required: false })
  @IsOptional()
  @IsString({ message: '父菜单ID必须是字符串' })
  parentId?: string;

  @ApiProperty({ description: '菜单状态', enum: MenuStatus, default: MenuStatus.DRAFT })
  @IsOptional()
  @IsEnum(MenuStatus, { message: '菜单状态格式不正确' })
  status?: MenuStatus;

  @ApiProperty({ description: '排序权重', required: false })
  @IsOptional()
  @IsNumber({}, { message: '排序权重必须是数字' })
  sortOrder?: number;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  enabled?: boolean = true;

  @ApiProperty({ description: '菜单描述', required: false })
  @IsOptional()
  @IsString({ message: '菜单描述必须是字符串' })
  description?: string;

  @ApiProperty({ description: '菜单图标', required: false })
  @IsOptional()
  @IsString({ message: '菜单图标必须是字符串' })
  icon?: string;
}
