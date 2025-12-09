import { IsUUID, IsInt, Min } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  skuId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
