import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsNumber()
  status: number; // 订单状态

  @IsString()
  @IsOptional()
  remark?: string; // 备注信息
}
