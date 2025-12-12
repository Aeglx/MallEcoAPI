import { IsUUID, IsArray, IsOptional, IsString, IsInt } from 'class-validator';

// 订单商品项DTO
export class OrderItemDto {
  @IsUUID()
  skuId: string;

  @IsInt()
  quantity: number;

  @IsInt()
  price: number;

  @IsString()
  skuName: string;
}

// 创建订单DTO
export class CreateOrderDto {
  @IsUUID()
  @IsOptional()
  addressId?: string; // 收货地址ID

  @IsString()
  @IsOptional()
  remark?: string; // 订单备注

  @IsUUID()
  @IsOptional()
  couponId?: string; // 优惠券ID

  @IsInt()
  @IsOptional()
  points?: number; // 使用积分

  @IsArray()
  items: OrderItemDto[]; // 订单商品列表

  @IsString()
  paymentMethod: string; // 支付方式
}
