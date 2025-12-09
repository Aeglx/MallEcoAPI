import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// 订单详情DTO
export class OrderItemDto {
  @ApiProperty({ description: '商品ID', example: '1' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ description: 'SKU ID', example: '1' })
  @IsNotEmpty()
  @IsString()
  skuId: string;

  @ApiProperty({ description: '商品名称', example: 'iPhone 15 Pro' })
  @IsNotEmpty()
  @IsString()
  productName: string;

  @ApiProperty({ description: '商品图片', example: 'https://example.com/product.jpg' })
  @IsNotEmpty()
  @IsString()
  productImage: string;

  @ApiProperty({ description: 'SKU规格', example: { '颜色': '深空黑色', '容量': '256GB' } })
  @IsNotEmpty()
  skuSpec: Record<string, string>;

  @ApiProperty({ description: '商品价格', example: 9999.00 })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({ description: '商品数量', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: '商品总价', example: 9999.00 })
  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;
}

// 订单列表查询DTO
export class QueryOrderDto {
  @ApiProperty({ description: '订单编号', example: '20231111123456', required: false })
  @IsOptional()
  @IsString()
  orderSn?: string;

  @ApiProperty({ description: '订单状态', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  orderStatus?: number;

  @ApiProperty({ description: '支付状态', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  payStatus?: number;

  @ApiProperty({ description: '物流状态', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  shipStatus?: number;

  @ApiProperty({ description: '收货人姓名', example: '张三', required: false })
  @IsOptional()
  @IsString()
  consigneeName?: string;

  @ApiProperty({ description: '收货人电话', example: '13800138000', required: false })
  @IsOptional()
  @IsString()
  consigneeMobile?: string;

  @ApiProperty({ description: '开始时间', example: '2023-11-01', required: false })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ description: '结束时间', example: '2023-11-30', required: false })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({ description: '当前页码', example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ description: '每页条数', example: 10 })
  @IsOptional()
  @IsNumber()
  pageSize?: number;
}

// 订单发货DTO
export class DeliverOrderDto {
  @ApiProperty({ description: '物流单号', example: 'SF1234567890' })
  @IsNotEmpty()
  @IsString()
  trackingNo: string;

  @ApiProperty({ description: '物流公司', example: 'SF' })
  @IsNotEmpty()
  @IsString()
  logisticsCompany: string;
}

// 订单备注DTO
export class UpdateOrderRemarkDto {
  @ApiProperty({ description: '订单备注', example: '加急处理' })
  @IsNotEmpty()
  @IsString()
  remark: string;
}