import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum CouponRecordStatus {
  UNUSED = 0, // 未使用
  USED = 1, // 已使用
  EXPIRED = 2, // 已过期
  INVALID = 3, // 已作废
}

export class QueryCouponRecordDto {
  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '页码必须是数字' })
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '每页数量必须是数字' })
  pageSize?: number = 10;

  @ApiProperty({ description: '卡券ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '卡券ID必须是数字' })
  couponId?: number;

  @ApiProperty({ description: '用户ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '用户ID必须是数字' })
  userId?: number;

  @ApiProperty({ description: '卡券记录状态', enum: CouponRecordStatus, required: false })
  @IsOptional()
  @IsEnum(CouponRecordStatus, { message: '卡券记录状态格式不正确' })
  status?: CouponRecordStatus;

  @ApiProperty({ description: '开始时间', required: false })
  @IsOptional()
  @IsString({ message: '开始时间必须是字符串' })
  startTime?: string;

  @ApiProperty({ description: '结束时间', required: false })
  @IsOptional()
  @IsString({ message: '结束时间必须是字符串' })
  endTime?: string;
}
