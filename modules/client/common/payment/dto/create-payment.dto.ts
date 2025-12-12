import { IsString, IsNumber, IsNotEmpty, IsOptional, IsDecimal, IsUrl, IsEnum } from 'class-validator';
import { PayType } from '../enum/payment-status.enum';

export class CreatePaymentDto {
  @IsString({ message: '订单编号不能为空' })
  @IsNotEmpty()
  orderSn: string;

  @IsDecimal({ decimal_digits: '0,2' })
  @IsNotEmpty()
  payAmount: number;

  @IsEnum(PayType, { message: '支付方式无效' })
  @IsNotEmpty()
  payType: PayType;

  @IsUrl({}, { message: '回调URL必须是有效的URL' })
  @IsOptional()
  callbackUrl?: string;

  @IsUrl({}, { message: '返回URL必须是有效的URL' })
  @IsOptional()
  returnUrl?: string;

  @IsString()
  @IsOptional()
  extendParams?: string;
}
