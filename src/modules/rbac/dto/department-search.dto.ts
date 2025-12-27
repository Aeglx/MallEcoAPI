import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class DepartmentSearchDto {
  @ApiProperty({ description: '部门名称', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: '部门编码', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ description: '部门状态', required: false })
  @IsNumber()
  @IsOptional()
  status?: number;

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
