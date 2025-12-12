import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWithdrawOrderDto {
  @ApiProperty({ description: '用户ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: '提现金额' })
  @IsNumber()
  @Min(10)
  amount: number;

  @ApiProperty({ 
    description: '提现方式',
    enum: ['alipay', 'wechat', 'bank_card']
  })
  @IsEnum(['alipay', 'wechat', 'bank_card'])
  withdrawMethod: string;

  @ApiProperty({ description: '账户信息' })
  accountInfo: {
    alipayAccount?: string;
    wechatOpenId?: string;
    bankCardNo?: string;
    bankName?: string;
    accountHolder?: string;
  };

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}