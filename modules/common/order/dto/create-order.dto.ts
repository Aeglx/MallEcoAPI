import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty({
    description: '商品ID',
    example: '1',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'SKU ID',
    example: '1',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  skuId: string;

  @ApiProperty({
    description: '商品数量',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: '商品价格',
    example: 13999,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  price: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: '会员ID',
    example: '1',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  memberId: string;

  @ApiProperty({
    description: '店铺ID',
    example: '1',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  storeId: string;

  @ApiProperty({
    description: '收货人姓名',
    example: '张三',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  consigneeName: string;

  @ApiProperty({
    description: '收货人电话',
    example: '13800138000',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  consigneeMobile: string;

  @ApiProperty({
    description: '收货人地址',
    example: '北京市朝阳区建国路88号',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  consigneeAddress: string;

  @ApiProperty({
    description: '订单商品项',
    type: [OrderItemDto],
    required: true,
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    description: '订单备注',
    example: '请尽快发货',
    required: false,
  })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({
    description: '支付方式',
    example: 'wechat',
    required: false,
  })
  @IsOptional()
  @IsString()
  payType?: string;
}
