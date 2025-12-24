import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class MenuSearchDto {
  @ApiProperty({ description: '菜单名称', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: '菜单路径', required: false })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiProperty({ description: '菜单类型', required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ description: '是否显示', required: false })
  @IsBoolean()
  @IsOptional()
  visible?: boolean;

  @ApiProperty({ description: '页码', default: 1 })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiProperty({ description: '每页数量', default: 10 })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiProperty({ description: '排序字段', default: 'sort' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiProperty({ description: '排序方向', default: 'ASC' })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}