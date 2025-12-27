import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryWechatSubscribeDto {
  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ description: '每页数量', required: false, default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  pageSize?: number;

  @ApiProperty({ description: 'openid', required: false })
  @IsOptional()
  @IsString()
  openid?: string;

  @ApiProperty({ description: '模板ID', required: false })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  status?: number;

  @ApiProperty({ description: '场景', required: false })
  @IsOptional()
  @IsString()
  scene?: string;

  @ApiProperty({ description: '业务类型', required: false })
  @IsOptional()
  @IsString()
  businessType?: string;

  @ApiProperty({ description: '开始时间', required: false })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  startTime?: Date;

  @ApiProperty({ description: '结束时间', required: false })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  endTime?: Date;
}
