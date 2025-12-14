import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class QueryPaymentDto {
  @IsNotEmpty({ message: '商户订单号不能为空' })
  @IsString()
  outTradeNo: string;

  @IsOptional()
  @IsString()
  returnUrl?: string;

  @IsOptional()
  @IsString()
  openId?: string;
}
