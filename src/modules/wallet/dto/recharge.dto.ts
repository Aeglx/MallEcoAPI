import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RechargeDto {
  @ApiProperty({
    description: '充值金额',
    example: 100.00,
    minimum: 0.01
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: '支付方式',
    example: 'alipay'
  })
  @IsNotEmpty()
  paymentMethod: string;
}
