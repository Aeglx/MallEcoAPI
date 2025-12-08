import { IsString, IsNumber, IsNotEmpty, IsOptional, IsDecimal, IsEnum } from 'class-validator';
import { RefundStatus } from '../enum/payment-status.enum';

export class RefundPaymentDto {
  @IsString({ message: '支付编号不能为空' })
  @IsNotEmpty()
  paySn: string;

  @IsDecimal({ decimal_digits: '0,2', message: '退款金额必须是有效的数字' })
  @IsNotEmpty()
  refundAmount: number;

  @IsString({ message: '退款原因不能为空' })
  @IsNotEmpty()
  refundReason: string;

  @IsString()
  @IsOptional()
  refundNo?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}
