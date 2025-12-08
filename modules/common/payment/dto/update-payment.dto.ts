import { IsString, IsNumber, IsOptional, IsDecimal, IsUrl, IsEnum } from 'class-validator';
import { PayStatus } from '../enum/payment-status.enum';

export class UpdatePaymentDto {
  @IsEnum(PayStatus, { message: '支付状态无效' })
  @IsOptional()
  payStatus?: PayStatus;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  callbackContent?: string;

  @IsUrl({}, { message: '回调URL必须是有效的URL' })
  @IsOptional()
  callbackUrl?: string;

  @IsUrl({}, { message: '返回URL必须是有效的URL' })
  @IsOptional()
  returnUrl?: string;

  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  payAmount?: number;
}
