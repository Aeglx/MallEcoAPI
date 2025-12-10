import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { LiveStatusEnum, LiveTypeEnum } from '../enums/live-status.enum';

export class LiveRoomProductDto {
  @ApiProperty({ description: '商品ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: '展示顺序', default: 0 })
  @IsOptional()
  displayOrder?: number = 0;

  @ApiProperty({ description: '直播价', required: false })
  @IsOptional()
  livePrice?: number;

  @ApiProperty({ description: '秒杀价', required: false })
  @IsOptional()
  flashSalePrice?: number;

  @ApiProperty({ description: '秒杀库存', required: false })
  @IsOptional()
  flashSaleStock?: number;
}

export class CreateLiveRoomDto {
  @ApiProperty({ description: '直播间标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '直播间描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '直播间封面图', required: false })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ description: '直播类型', enum: LiveTypeEnum })
  @IsEnum(LiveTypeEnum)
  type: LiveTypeEnum;

  @ApiProperty({ description: '预定开始时间', required: false })
  @IsOptional()
  @IsDateString()
  scheduledStartTime?: string;

  @ApiProperty({ description: '最大观看人数', required: false })
  @IsOptional()
  maxViewers?: number;

  @ApiProperty({ description: '是否允许聊天', default: true })
  @IsOptional()
  @IsBoolean()
  enableChat?: boolean = true;

  @ApiProperty({ description: '是否允许送礼', default: true })
  @IsOptional()
  @IsBoolean()
  enableGift?: boolean = true;

  @ApiProperty({ description: '是否录制回放', default: false })
  @IsOptional()
  @IsBoolean()
  isRecording?: boolean = false;

  @ApiProperty({ description: '直播商品列表', required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LiveRoomProductDto)
  products?: LiveRoomProductDto[];

  @ApiProperty({ description: '直播设置', required: false })
  @IsOptional()
  settings?: Record<string, any>;
}