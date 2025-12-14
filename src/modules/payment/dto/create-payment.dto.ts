import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export enum PaymentClient {
  PC = 'pc',
  H5 = 'h5',
  APP = 'app',
  MINI_PROGRAM = 'mini_program',
}

export class CreatePaymentDto {
  @IsNotEmpty({ message: '订单ID不能为空' })
  @IsString()
  orderId: string;

  @IsNotEmpty({ message: '支付方式编码不能为空' })
  @IsString()
  paymentMethod: string;

  @IsNotEmpty({ message: '支付客户端类型不能为空' })
  @IsEnum(PaymentClient)
  paymentClient: PaymentClient;

  @IsNotEmpty({ message: '支付金额不能为空' })
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  returnUrl?: string;
}
