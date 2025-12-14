import { IsOptional, IsString, IsNumber } from 'class-validator';

export class PaymentCallbackDto {
  @IsOptional()
  @IsString()
  tradeNo?: string;

  @IsOptional()
  @IsString()
  outTradeNo?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  totalAmount?: number;

  @IsOptional()
  @IsString()
  tradeStatus?: string;

  @IsOptional()
  @IsString()
  paymentTime?: string;

  @IsOptional()
  @IsString()
  sign?: string;

  @IsOptional()
  @IsString()
  signType?: string;

  @IsOptional()
  @IsString()
  gmtPayment?: string;

  @IsOptional()
  [key: string]: any;
}
