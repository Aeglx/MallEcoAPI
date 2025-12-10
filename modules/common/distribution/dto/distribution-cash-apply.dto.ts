import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsEnum, MaxLength, Min, IsOptional } from 'class-validator';

export enum CashType {
  BANK_CARD = 0,
  ALIPAY = 1,
  WECHAT = 2,
}

export class DistributionCashApplyDto {
  @ApiProperty({ description: '提现金额' })
  @IsNotEmpty({ message: '提现金额不能为空' })
  @IsNumber({}, { message: '提现金额必须是数字' })
  @Min(0.01, { message: '提现金额必须大于0.01' })
  cashAmount: number;

  @ApiProperty({ description: '提现方式', enum: CashType })
  @IsNotEmpty({ message: '提现方式不能为空' })
  @IsEnum(CashType)
  cashType: CashType;

  @ApiProperty({ description: '收款账号' })
  @IsNotEmpty({ message: '收款账号不能为空' })
  @IsString({ message: '收款账号必须是字符串' })
  @MaxLength(100, { message: '收款账号不能超过100位' })
  accountNo: string;

  @ApiProperty({ description: '收款人姓名' })
  @IsNotEmpty({ message: '收款人姓名不能为空' })
  @IsString({ message: '收款人姓名必须是字符串' })
  @MaxLength(64, { message: '收款人姓名不能超过64位' })
  accountName: string;

  @ApiProperty({ description: '银行名称', required: false })
  @IsOptional()
  @IsString({ message: '银行名称必须是字符串' })
  @MaxLength(100, { message: '银行名称不能超过100位' })
  bankName?: string;

  @ApiProperty({ description: '开户行', required: false })
  @IsOptional()
  @IsString({ message: '开户行必须是字符串' })
  @MaxLength(200, { message: '开户行不能超过200位' })
  bankBranch?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  @MaxLength(500, { message: '备注不能超过500位' })
  remark?: string;
}