import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateActivityDto {
  @IsNotEmpty({ message: '活动名称不能为空' })
  @IsString({ message: '活动名称必须是字符串' })
  @ApiProperty({
    name: 'activityName',
    description: '活动名称',
    example: '双11促销活动',
    required: true,
  })
  activityName: string;

  @IsNotEmpty({ message: '活动类型不能为空' })
  @IsNumber({}, { message: '活动类型必须是数字' })
  @Min(0, { message: '活动类型最小值为0' })
  @Max(2, { message: '活动类型最大值为2' })
  @ApiProperty({
    name: 'activityType',
    description: '活动类型：0-满减活动，1-限时折扣，2-秒杀活动',
    example: 0,
    required: true,
  })
  activityType: number;

  @IsOptional()
  @IsString({ message: '活动描述必须是字符串' })
  @ApiProperty({
    name: 'description',
    description: '活动描述',
    example: '双11全场促销活动',
    required: false,
  })
  description: string;

  @IsNotEmpty({ message: '开始时间不能为空' })
  @IsDateString({}, { message: '开始时间必须是有效的日期字符串' })
  @ApiProperty({
    name: 'startTime',
    description: '开始时间',
    example: '2023-11-11 00:00:00',
    required: true,
  })
  startTime: Date;

  @IsNotEmpty({ message: '结束时间不能为空' })
  @IsDateString({}, { message: '结束时间必须是有效的日期字符串' })
  @ApiProperty({
    name: 'endTime',
    description: '结束时间',
    example: '2023-11-11 23:59:59',
    required: true,
  })
  endTime: Date;

  @IsOptional()
  @IsString({ message: '活动图片必须是字符串' })
  @ApiProperty({
    name: 'imageUrl',
    description: '活动图片',
    example: 'https://example.com/activity.jpg',
    required: false,
  })
  imageUrl: string;

  @IsOptional()
  @ApiProperty({
    name: 'rules',
    description: '活动规则',
    example: { minAmount: 100, discountAmount: 20 },
    required: false,
  })
  rules: any;

  @IsOptional()
  @IsNumber({}, { message: '是否置顶必须是数字' })
  @Min(0, { message: '是否置顶最小值为0' })
  @Max(1, { message: '是否置顶最大值为1' })
  @ApiProperty({ name: 'isTop', description: '是否置顶', example: 0, required: false })
  isTop: number;
}
