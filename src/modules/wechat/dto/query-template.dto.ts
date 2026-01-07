import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsIn, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryTemplateDto {
  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: '页码不能小于1' })
  pageNumber?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, default: 20 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: '每页数量不能小于1' })
  @Max(100, { message: '每页数量不能超过100' })
  pageSize?: number = 20;

  @ApiProperty({ description: '模板标题', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: '模板ID', required: false })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiProperty({ description: '状态：1-启用，0-禁用', required: false })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null && value !== '' ? parseInt(value) : undefined))
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1], { message: '状态只能是0或1' })
  status?: number;
}

