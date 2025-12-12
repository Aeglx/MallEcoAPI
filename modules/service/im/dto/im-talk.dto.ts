import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImTalkQueryParams {
  @ApiProperty({ description: '页码', default: 1, required: false })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ description: '每页数量', default: 10, required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiProperty({ description: '是否置顶', required: false })
  @IsOptional()
  @IsBoolean()
  top?: boolean;

  @ApiProperty({ description: '是否禁用', required: false })
  @IsOptional()
  @IsBoolean()
  disable?: boolean;

  @ApiProperty({ description: '搜索关键词', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;
}

export class TopTalkDto {
  @ApiProperty({ description: '是否置顶', required: true })
  @IsBoolean()
  top: boolean;
}