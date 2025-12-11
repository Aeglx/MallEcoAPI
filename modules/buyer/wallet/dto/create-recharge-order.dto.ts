import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRechargeOrderDto {
  @ApiProperty({ description: '用户ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: '充值金额' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ 
    description: '支付方式',
    enum: ['alipay', 'wechat', 'bank_card', 'paypal']
  })
  @IsEnum(['alipay', 'wechat', 'bank_card', 'paypal'])
  paymentMethod: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}