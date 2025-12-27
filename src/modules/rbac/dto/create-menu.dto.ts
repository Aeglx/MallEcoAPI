import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({ description: '菜单名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '菜单路径', required: false })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiProperty({ description: '菜单图标', required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: '父级菜单ID', required: false })
  @IsNumber()
  @IsOptional()
  parentId?: number;

  @ApiProperty({ description: '排序号', default: 0 })
  @IsNumber()
  @IsOptional()
  sort?: number;

  @ApiProperty({ description: '是否显示', default: true })
  @IsBoolean()
  @IsOptional()
  visible?: boolean;

  @ApiProperty({ description: '权限标识', required: false })
  @IsString()
  @IsOptional()
  permission?: string;

  @ApiProperty({ description: '组件路径', required: false })
  @IsString()
  @IsOptional()
  component?: string;

  @ApiProperty({ description: '菜单类型', default: 'menu' })
  @IsString()
  @IsOptional()
  type?: string;
}
