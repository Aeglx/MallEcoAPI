import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { LiveStatusEnum, LiveTypeEnum } from '../enums/live-status.enum';
import { Type } from 'class-transformer';

export class LiveRoomSearchParams {
  @ApiPropertyOptional({ description: '直播间标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '主播用户ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: '店铺ID' })
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiPropertyOptional({ description: '直播状态', enum: LiveStatusEnum })
  @IsOptional()
  @IsEnum(LiveStatusEnum)
  status?: LiveStatusEnum;

  @ApiPropertyOptional({ description: '直播类型', enum: LiveTypeEnum })
  @IsOptional()
  @IsEnum(LiveTypeEnum)
  type?: LiveTypeEnum;

  @ApiPropertyOptional({ description: '开始时间（开始）' })
  @IsOptional()
  @IsDateString()
  startTimeFrom?: string;

  @ApiPropertyOptional({ description: '开始时间（结束）' })
  @IsOptional()
  @IsDateString()
  startTimeTo?: string;

  @ApiPropertyOptional({ description: '是否允许聊天' })
  @IsOptional()
  enableChat?: boolean;

  @ApiPropertyOptional({ description: '是否允许送礼' })
  @IsOptional()
  enableGift?: boolean;

  @ApiPropertyOptional({ description: '当前页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  size?: number = 10;

  @ApiPropertyOptional({ description: '排序字段', default: 'createTime' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createTime';

  @ApiPropertyOptional({ description: '排序方向', default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}