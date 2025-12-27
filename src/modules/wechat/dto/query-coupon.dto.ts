import { IsOptional, IsNumber, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CouponType, CouponStatus } from './create-coupon.dto';

export class QueryCouponDto {
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

  @ApiProperty({ description: '卡券标题', required: false })
  @IsOptional()
  @IsString({ message: '卡券标题必须是字符串' })
  title?: string;

  @ApiProperty({ description: '卡券类型', enum: CouponType, required: false })
  @IsOptional()
  @IsEnum(CouponType, { message: '卡券类型格式不正确' })
  couponType?: CouponType;

  @ApiProperty({ description: '卡券状态', enum: CouponStatus, required: false })
  @IsOptional()
  @IsEnum(CouponStatus, { message: '卡券状态格式不正确' })
  status?: CouponStatus;

  @ApiProperty({ description: '开始时间', required: false })
  @IsOptional()
  @IsString({ message: '开始时间必须是字符串' })
  startTime?: string;

  @ApiProperty({ description: '结束时间', required: false })
  @IsOptional()
  @IsString({ message: '结束时间必须是字符串' })
  endTime?: string;
}
