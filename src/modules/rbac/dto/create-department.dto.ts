import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ description: '部门名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '部门编码', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ description: '部门描述', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '父级部门ID', required: false })
  @IsNumber()
  @IsOptional()
  parentId?: number;

  @ApiProperty({ description: '排序号', default: 0 })
  @IsNumber()
  @IsOptional()
  sort?: number;

  @ApiProperty({ description: '是否启用', default: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiProperty({ description: '负责人', required: false })
  @IsString()
  @IsOptional()
  leader?: string;

  @ApiProperty({ description: '联系电话', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: '部门地址', required: false })
  @IsString()
  @IsOptional()
  address?: string;
}