import { IsOptional, IsString, IsNumber, IsDateString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCouponDto {
  @IsOptional()
  @IsString({ message: '优惠券名称必须是字符串' })
  @ApiProperty({
    name: 'couponName',
    description: '优惠券名称',
    example: '满100减10',
    required: false,
  })
  couponName?: string;

  @IsOptional()
  @IsNumber({}, { message: '优惠券类型必须是数字' })
  @Min(0, { message: '优惠券类型最小值为0' })
  @Max(2, { message: '优惠券类型最大值为2' })
  @ApiProperty({
    name: 'couponType',
    description: '优惠券类型：0-满减券，1-折扣券，2-免运费券',
    example: 0,
    required: false,
  })
  couponType?: number;

  @IsOptional()
  @IsNumber({}, { message: '总数量必须是数字' })
  @Min(0, { message: '总数量不能小于0' })
  @ApiProperty({ name: 'totalCount', description: '总数量', example: 100, required: false })
  totalCount?: number;

  @IsOptional()
  @IsNumber({}, { message: '最低使用金额必须是数字' })
  @Min(0, { message: '最低使用金额不能小于0' })
  @ApiProperty({ name: 'minAmount', description: '最低使用金额', example: 100, required: false })
  minAmount?: number;

  @IsOptional()
  @IsNumber({}, { message: '减免金额必须是数字' })
  @Min(0, { message: '减免金额不能小于0' })
  @ApiProperty({ name: 'discountAmount', description: '减免金额', example: 10, required: false })
  discountAmount?: number;

  @IsOptional()
  @IsNumber({}, { message: '折扣率必须是数字' })
  @Min(1, { message: '折扣率不能小于1' })
  @Max(10, { message: '折扣率不能大于10' })
  @ApiProperty({ name: 'discountRate', description: '折扣率(1-10)', example: 8, required: false })
  discountRate?: number;

  @IsOptional()
  @IsDateString({}, { message: '开始时间必须是有效的日期字符串' })
  @ApiProperty({
    name: 'startTime',
    description: '开始时间',
    example: '2023-01-01 00:00:00',
    required: false,
  })
  startTime?: Date;

  @IsOptional()
  @IsDateString({}, { message: '结束时间必须是有效的日期字符串' })
  @ApiProperty({
    name: 'endTime',
    description: '结束时间',
    example: '2023-12-31 23:59:59',
    required: false,
  })
  endTime?: Date;

  @IsOptional()
  @IsNumber({}, { message: '状态必须是数字' })
  @Min(0, { message: '状态最小值为0' })
  @Max(2, { message: '状态最大值为2' })
  @ApiProperty({
    name: 'status',
    description: '状态：0-未发布，1-进行中，2-已结束',
    example: 1,
    required: false,
  })
  status?: number;

  @IsOptional()
  @IsNumber({}, { message: '是否可重复使用必须是数字' })
  @Min(0, { message: '是否可重复使用最小值为0' })
  @Max(1, { message: '是否可重复使用最大值为1' })
  @ApiProperty({ name: 'isReusable', description: '是否可重复使用', example: 0, required: false })
  isReusable?: number;

  @IsOptional()
  @IsNumber({}, { message: '适用范围必须是数字' })
  @Min(0, { message: '适用范围最小值为0' })
  @Max(2, { message: '适用范围最大值为2' })
  @ApiProperty({
    name: 'applicableRange',
    description: '适用范围：0-全场通用，1-指定商品，2-指定分类',
    example: 0,
    required: false,
  })
  applicableRange?: number;

  @IsOptional()
  @IsString({ message: '适用商品/分类ID必须是字符串' })
  @ApiProperty({
    name: 'applicableIds',
    description: '适用商品/分类ID',
    example: '1,2,3',
    required: false,
  })
  applicableIds?: string;
}
