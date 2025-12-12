import { IsUUID, IsInt, Min, IsOptional, IsBoolean } from 'class-validator';

export class UpdateCartDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsBoolean()
  selected?: boolean;
}

// 批量更新购物车商品的选中状态
export class UpdateCartSelectedDto {
  @IsOptional()
  @IsBoolean()
  selected: boolean;

  @IsOptional()
  @IsUUID('4', { each: true })
  ids?: string[];
}
