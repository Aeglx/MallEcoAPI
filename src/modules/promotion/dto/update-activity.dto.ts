import { IsOptional, IsString, IsNumber, IsDateString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateActivityDto {
  @IsOptional()
  @IsString({ message: '活动名称必须是字符串' })
  @ApiProperty({ name: 'activityName', description: '活动名称', example: '双11促销活动', required: false })
  activityName?: string;

  @IsOptional()
  @IsNumber({}, { message: '活动类型必须是数字' })
  @Min(0, { message: '活动类型最小值为0' })
  @Max(2, { message: '活动类型最大值为2' })
  @ApiProperty({ name: 'activityType', description: '活动类型：0-满减活动，1-限时折扣，2-秒杀活动', example: 0, required: false })
  activityType?: number;

  @IsOptional()
  @IsString({ message: '活动描述必须是字符串' })
  @ApiProperty({ name: 'description', description: '活动描述', example: '双11全场促销活动', required: false })
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: '开始时间必须是有效的日期字符串' })
  @ApiProperty({ name: 'startTime', description: '开始时间', example: '2023-11-11 00:00:00', required: false })
  startTime?: Date;

  @IsOptional()
  @IsDateString({}, { message: '结束时间必须是有效的日期字符串' })
  @ApiProperty({ name: 'endTime', description: '结束时间', example: '2023-11-11 23:59:59', required: false })
  endTime?: Date;

  @IsOptional()
  @IsNumber({}, { message: '状态必须是数字' })
  @Min(0, { message: '状态最小值为0' })
  @Max(2, { message: '状态最大值为2' })
  @ApiProperty({ name: 'status', description: '状态：0-未发布，1-进行中，2-已结束', example: 1, required: false })
  status?: number;

  @IsOptional()
  @IsString({ message: '活动图片必须是字符串' })
  @ApiProperty({ name: 'imageUrl', description: '活动图片', example: 'https://example.com/activity.jpg', required: false })
  imageUrl?: string;

  @IsOptional()
  @ApiProperty({ name: 'rules', description: '活动规则', example: { minAmount: 100, discountAmount: 20 }, required: false })
  rules?: any;

  @IsOptional()
  @IsNumber({}, { message: '是否置顶必须是数字' })
  @Min(0, { message: '是否置顶最小值为0' })
  @Max(1, { message: '是否置顶最大值为1' })
  @ApiProperty({ name: 'isTop', description: '是否置顶', example: 0, required: false })
  isTop?: number;
}
