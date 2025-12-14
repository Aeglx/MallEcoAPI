import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class RechargeDto {
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  paymentMethod: string;
}
