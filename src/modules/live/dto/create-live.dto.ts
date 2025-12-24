import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLiveDto {
  @IsNotEmpty({ message: '直播标题不能为空' })
  @IsString({ message: '直播标题必须是字符串' })
  @ApiProperty({ name: 'liveTitle', description: '直播标题', example: '新品发布会', required: true })
  liveTitle: string;

  @IsOptional()
  @IsString({ message: '直播描述必须是字符串' })
  @ApiProperty({ name: 'liveDescription', description: '直播描述', example: '最新产品发布直播', required: false })
  liveDescription: string;

  @IsOptional()
  @IsString({ message: '直播封面必须是字符串' })
  @ApiProperty({ name: 'liveCover', description: '直播封面图片', example: 'https://example.com/cover.jpg', required: false })
  liveCover: string;

  @IsNotEmpty({ message: '主播名称不能为空' })
  @IsString({ message: '主播名称必须是字符串' })
  @ApiProperty({ name: 'anchorName', description: '主播名称', example: '小主播', required: true })
  anchorName: string;

  @IsOptional()
  @IsString({ message: '主播头像必须是字符串' })
  @ApiProperty({ name: 'anchorAvatar', description: '主播头像', example: 'https://example.com/avatar.jpg', required: false })
  anchorAvatar: string;

  @IsOptional()
  @IsDateString({}, { message: '开始时间必须是有效的日期字符串' })
  @ApiProperty({ name: 'startTime', description: '开始时间', example: '2023-12-01 19:00:00', required: false })
  startTime: Date;

  @IsOptional()
  @IsDateString({}, { message: '结束时间必须是有效的日期字符串' })
  @ApiProperty({ name: 'endTime', description: '结束时间', example: '2023-12-01 21:00:00', required: false })
  endTime: Date;

  @IsOptional()
  @IsNumber({}, { message: '直播状态必须是数字' })
  @ApiProperty({ name: 'liveStatus', description: '直播状态：0-未开始，1-直播中，2-已结束，3-已取消', example: 0, required: false })
  liveStatus: number;

  @IsOptional()
  @IsString({ message: '直播观看地址必须是字符串' })
  @ApiProperty({ name: 'liveUrl', description: '直播观看地址', example: 'https://example.com/live/123', required: false })
  liveUrl: string;

  @IsOptional()
  @IsString({ message: '直播间号必须是字符串' })
  @ApiProperty({ name: 'roomNumber', description: '直播间号', example: '123456', required: false })
  roomNumber: string;

  @IsOptional()
  @IsNumber({}, { message: '是否置顶必须是数字' })
  @ApiProperty({ name: 'isTop', description: '是否置顶', example: 0, required: false })
  isTop: number;

  @IsOptional()
  @IsNumber({}, { message: '是否推荐必须是数字' })
  @ApiProperty({ name: 'isRecommend', description: '是否推荐', example: 0, required: false })
  isRecommend: number;

  @IsOptional()
  @IsString({ message: '直播简介必须是字符串' })
  @ApiProperty({ name: 'liveIntro', description: '直播简介', example: '这是一场精彩的直播', required: false })
  liveIntro: string;
}
