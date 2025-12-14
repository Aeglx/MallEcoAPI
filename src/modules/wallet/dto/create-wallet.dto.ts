import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWalletDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}
