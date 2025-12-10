import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsEnum, IsArray } from 'class-validator';

/**
 * 创建优惠券DTO
 */
export class CouponCreateDto {
  @ApiProperty({ description: '优惠券名称' })
  @IsNotEmpty({ message: '优惠券名称不能为空' })
  @IsString({ message: '优惠券名称必须是字符串' })
  name: string;

  @ApiProperty({ description: '优惠券类型 1-满减券 2-折扣券 3-现金券' })
  @IsNotEmpty({ message: '优惠券类型不能为空' })
  @IsNumber({}, { message: '优惠券类型必须是数字' })
  @IsEnum([1, 2, 3], { message: '优惠券类型只能是1、2、3' })
  type: number;

  @ApiProperty({ description: '面额' })
  @IsNotEmpty({ message: '面额不能为空' })
  @IsNumber({}, { message: '面额必须是数字' })
  amount: number;

  @ApiProperty({ description: '最低消费金额' })
  @IsOptional()
  @IsNumber({}, { message: '最低消费金额必须是数字' })
  minAmount: number;

  @ApiProperty({ description: '折扣率' })
  @IsOptional()
  @IsNumber({}, { message: '折扣率必须是数字' })
  discount: number;

  @ApiProperty({ description: '发放方式 1-主动领取 2-系统发放 3-注册赠送 4-活动赠送' })
  @IsNotEmpty({ message: '发放方式不能为空' })
  @IsNumber({}, { message: '发放方式必须是数字' })
  @IsEnum([1, 2, 3, 4], { message: '发放方式只能是1、2、3、4' })
  grantType: number;

  @ApiProperty({ description: '使用范围 0-全场通用 1-指定商品 2-指定分类 3-指定品牌' })
  @IsNotEmpty({ message: '使用范围不能为空' })
  @IsNumber({}, { message: '使用范围必须是数字' })
  @IsEnum([0, 1, 2, 3], { message: '使用范围只能是0、1、2、3' })
  useRange: number;

  @ApiProperty({ description: '适用范围ID列表' })
  @IsOptional()
  @IsArray({ message: '适用范围ID列表必须是数组' })
  useRangeIds: string[];

  @ApiProperty({ description: '发放总数 0表示不限制' })
  @IsOptional()
  @IsNumber({}, { message: '发放总数必须是数字' })
  totalCount: number;

  @ApiProperty({ description: '发放开始时间' })
  @IsOptional()
  grantStartTime: Date;

  @ApiProperty({ description: '发放结束时间' })
  @IsOptional()
  grantEndTime: Date;

  @ApiProperty({ description: '有效开始时间' })
  @IsOptional()
  validStartTime: Date;

  @ApiProperty({ description: '有效结束时间' })
  @IsOptional()
  validEndTime: Date;

  @ApiProperty({ description: '有效期类型 1-固定时间 2-领取后N天有效' })
  @IsOptional()
  @IsNumber({}, { message: '有效期类型必须是数字' })
  @IsEnum([1, 2], { message: '有效期类型只能是1、2' })
  validType: number;

  @ApiProperty({ description: '有效天数' })
  @IsOptional()
  @IsNumber({}, { message: '有效天数必须是数字' })
  validDays: number;

  @ApiProperty({ description: '每人限领数量 0表示不限制' })
  @IsOptional()
  @IsNumber({}, { message: '每人限领数量必须是数字' })
  limitCount: number;

  @ApiProperty({ description: '使用说明' })
  @IsOptional()
  @IsString({ message: '使用说明必须是字符串' })
  description: string;

  @ApiProperty({ description: '备注' })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark: string;
}