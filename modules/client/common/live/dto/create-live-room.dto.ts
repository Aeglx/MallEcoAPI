import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLiveRoomDto {
  @ApiProperty({ description: '直播间标题', example: '双十一大促直播专场' })
  @IsNotEmpty({ message: '直播间标题不能为空' })
  @IsString({ message: '直播间标题必须是字符串' })
  title: string;

  @ApiProperty({ description: '直播间描述', example: '双十一优惠活动，全场商品5折起', required: false })
  @IsOptional()
  @IsString({ message: '直播间描述必须是字符串' })
  description?: string;

  @ApiProperty({ description: '主播ID', example: 'user123' })
  @IsNotEmpty({ message: '主播ID不能为空' })
  @IsString({ message: '主播ID必须是字符串' })
  anchorId: string;

  @ApiProperty({ description: '主播名称', example: '李佳琦' })
  @IsNotEmpty({ message: '主播名称不能为空' })
  @IsString({ message: '主播名称必须是字符串' })
  anchorName: string;

  @ApiProperty({ description: '直播间封面图URL', example: 'https://example.com/cover.jpg', required: false })
  @IsOptional()
  @IsString({ message: '封面图URL必须是字符串' })
  coverImage?: string;

  @ApiProperty({ description: '直播状态', enum: ['PENDING', 'LIVE', 'ENDED', 'PAUSED'], default: 'PENDING' })
  @IsOptional()
  @IsEnum(['PENDING', 'LIVE', 'ENDED', 'PAUSED'], { message: '直播状态必须是PENDING、LIVE、ENDED或PAUSED' })
  status?: string;

  @ApiProperty({ description: '计划开始时间', example: '2024-11-11T20:00:00Z', required: false })
  @IsOptional()
  @Type(() => Date)
  scheduledStartTime?: Date;

  @ApiProperty({ description: '是否推荐', example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: '是否推荐必须是布尔值' })
  isRecommended?: boolean;

  @ApiProperty({ description: '推荐权重', example: 0, required: false })
  @IsOptional()
  @IsNumber({}, { message: '推荐权重必须是数字' })
  recommendationWeight?: number;

  @ApiProperty({ description: '是否启用', example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: '是否启用必须是布尔值' })
  enabled?: boolean;
}