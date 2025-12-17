import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MenuType, MenuStatus } from '../services/wechat-menu.service';

export class QueryMenuDto {
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

  @ApiProperty({ description: '菜单名称', required: false })
  @IsOptional()
  @IsString({ message: '菜单名称必须是字符串' })
  name?: string;

  @ApiProperty({ description: '菜单类型', enum: MenuType, required: false })
  @IsOptional()
  @IsEnum(MenuType, { message: '菜单类型格式不正确' })
  menuType?: MenuType;

  @ApiProperty({ description: '菜单状态', enum: MenuStatus, required: false })
  @IsOptional()
  @IsEnum(MenuStatus, { message: '菜单状态格式不正确' })
  status?: MenuStatus;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  enabled?: boolean;

  @ApiProperty({ description: '父菜单ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '父菜单ID必须是数字' })
  parentId?: number;
}