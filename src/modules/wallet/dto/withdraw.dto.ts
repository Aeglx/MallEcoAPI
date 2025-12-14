import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class WithdrawDto {
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  bankAccount: string;

  @IsNotEmpty()
  bankName: string;

  @IsNotEmpty()
  accountName: string;
}
