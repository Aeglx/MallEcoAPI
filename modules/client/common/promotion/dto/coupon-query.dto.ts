import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';

/**
 * 优惠券查询DTO
 */
export class CouponQueryDto {
  @ApiProperty({ description: '页码', example: 1 })
  @IsOptional()
  @IsNumber({}, { message: '页码必须是数字' })
  page: number = 1;

  @ApiProperty({ description: '每页数量', example: 10 })
  @IsOptional()
  @IsNumber({}, { message: '每页数量必须是数字' })
  limit: number = 10;

  @ApiProperty({ description: '优惠券名称' })
  @IsOptional()
  @IsString({ message: '优惠券名称必须是字符串' })
  name: string;

  @ApiProperty({ description: '优惠券编码' })
  @IsOptional()
  @IsString({ message: '优惠券编码必须是字符串' })
  code: string;

  @ApiProperty({ description: '优惠券类型' })
  @IsOptional()
  @IsNumber({}, { message: '优惠券类型必须是数字' })
  type: number;

  @ApiProperty({ description: '状态' })
  @IsOptional()
  @IsNumber({}, { message: '状态必须是数字' })
  status: number;

  @ApiProperty({ description: '开始时间' })
  @IsOptional()
  startTime: Date;

  @ApiProperty({ description: '结束时间' })
  @IsOptional()
  endTime: Date;

  @ApiProperty({ description: '创建人' })
  @IsOptional()
  @IsString({ message: '创建人必须是字符串' })
  createBy: string;
}

/**
 * 优惠券状态枚举
 */
export enum CouponStatus {
  DISABLED = 0, // 禁用
  ENABLED = 1, // 启用
  EXPIRED = 2, // 已过期
}

/**
 * 优惠券类型枚举
 */
export enum CouponType {
  FULL_DISCOUNT = 1, // 满减券
  DISCOUNT = 2, // 折扣券
  CASH = 3, // 现金券
}

/**
 * 会员优惠券查询DTO
 */
export class CouponMemberQueryDto {
  @ApiProperty({ description: '页码', example: 1 })
  @IsOptional()
  @IsNumber({}, { message: '页码必须是数字' })
  page: number = 1;

  @ApiProperty({ description: '每页数量', example: 10 })
  @IsOptional()
  @IsNumber({}, { message: '每页数量必须是数字' })
  limit: number = 10;

  @ApiProperty({ description: '会员ID' })
  @IsOptional()
  @IsString({ message: '会员ID必须是字符串' })
  memberId: string;

  @ApiProperty({ description: '优惠券ID' })
  @IsOptional()
  @IsString({ message: '优惠券ID必须是字符串' })
  couponId: string;

  @ApiProperty({ description: '使用状态' })
  @IsOptional()
  @IsNumber({}, { message: '使用状态必须是数字' })
  @IsEnum([0, 1, 2], { message: '使用状态只能是0、1、2' })
  status: number;

  @ApiProperty({ description: '开始时间' })
  @IsOptional()
  startTime: Date;

  @ApiProperty({ description: '结束时间' })
  @IsOptional()
  endTime: Date;
}