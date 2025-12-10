import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class DistributionAuditDto {
  @ApiProperty({ description: '分销员ID' })
  @IsNotEmpty({ message: '分销员ID不能为空' })
  id: string;

  @ApiProperty({ description: '审核状态：1-通过，2-拒绝' })
  @IsNotEmpty({ message: '审核状态不能为空' })
  @IsNumber({}, { message: '审核状态必须是数字' })
  status: number;

  @ApiProperty({ description: '审核理由' })
  @IsOptional()
  @IsString({ message: '审核理由必须是字符串' })
  @MaxLength(500, { message: '审核理由不能超过500字' })
  auditReason?: string;
}