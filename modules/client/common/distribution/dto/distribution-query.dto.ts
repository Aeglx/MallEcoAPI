import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum DistributionStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
  DISABLED = 3,
}

export enum DistributionLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
}

export class DistributionQueryDto {
  @ApiProperty({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ description: '会员姓名' })
  @IsOptional()
  @IsString()
  memberName?: string;

  @ApiProperty({ description: '手机号' })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiProperty({ description: '分销码' })
  @IsOptional()
  @IsString()
  distributionCode?: string;

  @ApiProperty({ description: '状态', enum: DistributionStatus })
  @IsOptional()
  @IsEnum(DistributionStatus)
  status?: DistributionStatus;

  @ApiProperty({ description: '分销等级', enum: DistributionLevel })
  @IsOptional()
  @IsEnum(DistributionLevel)
  level?: DistributionLevel;

  @ApiProperty({ description: '上级分销码' })
  @IsOptional()
  @IsString()
  parentCode?: string;

  @ApiProperty({ description: '店铺ID' })
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiProperty({ description: '开始时间' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ description: '结束时间' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({ description: '排序字段', default: 'create_time' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'create_time';

  @ApiProperty({ description: '排序方向', default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}