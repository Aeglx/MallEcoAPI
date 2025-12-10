import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class DistributionApplyDTO {
  @ApiProperty({ description: '会员姓名' })
  @IsString()
  @IsNotEmpty({ message: '会员姓名不能为空' })
  name: string;

  @ApiProperty({ description: '身份证号' })
  @IsString()
  @IsNotEmpty({ message: '身份证号不能为空' })
  idNumber: string;

  @ApiProperty({ description: '结算银行开户行名称' })
  @IsString()
  @IsNotEmpty({ message: '结算银行开户行名称不能为空' })
  @MaxLength(200, { message: '结算银行开户行名称长度为1-200位' })
  settlementBankAccountName: string;

  @ApiProperty({ description: '结算银行开户账号' })
  @IsString()
  @IsNotEmpty({ message: '结算银行开户账号不能为空' })
  @MaxLength(200, { message: '结算银行开户账号长度为1-200位' })
  settlementBankAccountNum: string;

  @ApiProperty({ description: '结算银行开户支行名称' })
  @IsString()
  @IsNotEmpty({ message: '结算银行开户支行名称不能为空' })
  @MaxLength(200, { message: '结算银行开户支行名称长度为1-200位' })
  settlementBankBranchName: string;
}