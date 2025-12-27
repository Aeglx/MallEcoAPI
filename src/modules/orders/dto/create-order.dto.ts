import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';

/**
 * 创建订单商品项DTO
 */
export class CreateOrderItemDto {
  @ApiProperty({
    description: '商品ID',
    example: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({
    description: '商品数量',
    example: 2,
    type: Number,
    minimum: 1,
    maximum: 999,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(999)
  quantity: number;

  @ApiProperty({
    description: '商品单价',
    example: 199.99,
    type: Number,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: '商品名称',
    example: '测试商品',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  productName: string;

  @ApiProperty({
    description: '商品图片',
    example: 'test.jpg',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  productImage: string;

  @ApiProperty({
    description: '商品SKU',
    example: 'SKU001',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  productSku?: string;
}

/**
 * 创建订单DTO
 */
export class CreateOrderDto {
  @ApiProperty({
    description: '用户ID',
    example: '1',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: '支付方式：1-支付宝，2-微信',
    example: 1,
    type: Number,
    minimum: 1,
    maximum: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(2)
  payType: number;

  @ApiProperty({
    description: '优惠券金额',
    example: 10.0,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  couponAmount?: number;

  @ApiProperty({
    description: '运费',
    example: 5.0,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingFee?: number;

  @ApiProperty({
    description: '收货人姓名',
    example: '张三',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  consignee: string;

  @ApiProperty({
    description: '收货人手机号',
    example: '13800138000',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  mobile: string;

  @ApiProperty({
    description: '省份',
    example: '北京市',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  province: string;

  @ApiProperty({
    description: '城市',
    example: '北京市',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    description: '区/县',
    example: '朝阳区',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  district: string;

  @ApiProperty({
    description: '详细地址',
    example: '测试街道123号',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    description: '邮政编码',
    example: '100000',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({
    description: '用户订单备注',
    example: '请尽快发货',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  userNote?: string;

  @ApiProperty({
    description: '订单商品列表',
    type: [CreateOrderItemDto],
    example: [
      {
        productId: 1,
        quantity: 2,
        price: 199.99,
        productName: '测试商品',
        productImage: 'test.jpg',
        productSku: 'SKU001',
      },
    ],
  })
  @IsNotEmpty()
  items: CreateOrderItemDto[];
}
