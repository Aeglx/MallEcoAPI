import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryWechatFansDto {
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

  @ApiProperty({ description: '昵称搜索', required: false })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({ description: '关注状态', required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  subscribeStatus?: number;

  @ApiProperty({ description: '性别', required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  sex?: number;

  @ApiProperty({ description: '城市', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: '黑名单状态', required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  blacklist?: number;

  @ApiProperty({ description: '开始时间', required: false })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  startTime?: Date;

  @ApiProperty({ description: '结束时间', required: false })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  endTime?: Date;
}