import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsLength, IsOptional, MaxLength } from 'class-validator';

export class DistributionApplyDto {
  @ApiProperty({ description: '申请理由' })
  @IsNotEmpty({ message: '申请理由不能为空' })
  @IsString({ message: '申请理由必须是字符串' })
  @MaxLength(500, { message: '申请理由不能超过500字' })
  applyReason: string;

  @ApiProperty({ description: '分销码（可选，推荐人分销码）' })
  @IsOptional()
  @IsString({ message: '分销码必须是字符串' })
  @IsLength(32, 32, { message: '分销码长度必须为32位' })
  distributionCode?: string;

  @ApiProperty({ description: '店铺ID（可选，店铺分销员需要）' })
  @IsOptional()
  @IsString({ message: '店铺ID必须是字符串' })
  storeId?: string;

  @ApiProperty({ description: '店铺名称（可选，店铺分销员需要）' })
  @IsOptional()
  @IsString({ message: '店铺名称必须是字符串' })
  @MaxLength(128, { message: '店铺名称不能超过128字' })
  storeName?: string;
}