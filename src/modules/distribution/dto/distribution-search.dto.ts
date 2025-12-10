import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { DistributionStatusEnum } from '../enums/distribution-status.enum';
import { Transform, Type } from 'class-transformer';

export class DistributionSearchParams {
  @ApiProperty({ description: '会员ID', required: false })
  @IsString()
  @IsOptional()
  memberId?: string;

  @ApiProperty({ description: '会员名称', required: false })
  @IsString()
  @IsOptional()
  memberName?: string;

  @ApiProperty({ 
    description: '分销员状态', 
    enum: DistributionStatusEnum,
    required: false 
  })
  @IsString()
  @IsOptional()
  distributionStatus?: DistributionStatusEnum;

  @ApiProperty({ description: '店铺ID', required: false })
  @IsString()
  @IsOptional()
  storeId?: string;

  @ApiProperty({ description: '开始时间', required: false })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiProperty({ description: '结束时间', required: false })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiProperty({ description: '每页大小', required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  pageSize?: number = 10;
}