import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDate, IsArray } from 'class-validator';

// 订单状态枚举
export enum ManagerOrderStatus {
  ALL = -1,  // 全部
  PENDING_PAYMENT = 0,  // 待付款
  PENDING_SHIPMENT = 1,  // 待发货
  PENDING_RECEIPT = 2,  // 待收货
  COMPLETED = 3,  // 已完成
  CANCELLED = 4,  // 已取消
}

// 查询订单DTO
export class QueryOrderDto {
  @ApiPropertyOptional({
    description: '页码',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    description: '订单编号',
    example: '202312010001',
  })
  @IsOptional()
  @IsString()
  orderSn?: string;

  @ApiPropertyOptional({
    description: '会员ID',
    example: '123456',
  })
  @IsOptional()
  @IsString()
  memberId?: string;

  @ApiPropertyOptional({
    description: '订单状态',
    example: ManagerOrderStatus.PENDING_PAYMENT,
    enum: ManagerOrderStatus,
  })
  @IsOptional()
  @IsNumber()
  orderStatus?: number;

  @ApiPropertyOptional({
    description: '支付状态',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  payStatus?: number;

  @ApiPropertyOptional({
    description: '发货状态',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  shipStatus?: number;

  @ApiPropertyOptional({
    description: '开始时间',
    example: '2023-12-01',
  })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({
    description: '结束时间',
    example: '2023-12-31',
  })
  @IsOptional()
  @IsString()
  endTime?: string;
}

// 订单详情响应DTO
export class OrderDetailDto {
  @ApiProperty({
    description: '订单ID',
  })
  id: string;

  @ApiProperty({
    description: '订单编号',
  })
  orderSn: string;

  @ApiProperty({
    description: '会员ID',
  })
  memberId: string;

  @ApiProperty({
    description: '店铺ID',
  })
  storeId: string;

  @ApiProperty({
    description: '订单总金额',
  })
  totalAmount: number;

  @ApiProperty({
    description: '实际支付金额',
  })
  payAmount: number;

  @ApiProperty({
    description: '运费',
  })
  freightAmount: number;

  @ApiProperty({
    description: '优惠金额',
  })
  discountAmount: number;

  @ApiProperty({
    description: '订单状态',
  })
  orderStatus: number;

  @ApiProperty({
    description: '支付状态',
  })
  payStatus: number;

  @ApiProperty({
    description: '发货状态',
  })
  shipStatus: number;

  @ApiProperty({
    description: '支付方式',
  })
  payType: string;

  @ApiPropertyOptional({
    description: '支付时间',
  })
  payTime: Date;

  @ApiPropertyOptional({
    description: '发货时间',
  })
  shipTime: Date;

  @ApiPropertyOptional({
    description: '收货时间',
  })
  receiveTime: Date;

  @ApiPropertyOptional({
    description: '取消时间',
  })
  cancelTime: Date;

  @ApiProperty({
    description: '收货人姓名',
  })
  consigneeName: string;

  @ApiProperty({
    description: '收货人手机号',
  })
  consigneeMobile: string;

  @ApiProperty({
    description: '收货人地址',
  })
  consigneeAddress: string;

  @ApiPropertyOptional({
    description: '订单备注',
  })
  remark: string;

  @ApiPropertyOptional({
    description: '物流单号',
  })
  trackingNo: string;

  @ApiPropertyOptional({
    description: '物流公司',
  })
  logisticsCompany: string;

  @ApiProperty({
    description: '订单商品列表',
  })
  orderItems: any[];

  @ApiProperty({
    description: '订单日志列表',
  })
  orderLogs: any[];

  @ApiProperty({
    description: '创建时间',
  })
  createdAt: Date;

  @ApiProperty({
    description: '更新时间',
  })
  updatedAt: Date;
}

// 订单列表响应DTO
export class OrderListDto {
  @ApiProperty({
    description: '订单列表',
  })
  data: OrderDetailDto[];

  @ApiProperty({
    description: '总数',
  })
  total: number;

  @ApiProperty({
    description: '页码',
  })
  page: number;

  @ApiProperty({
    description: '每页数量',
  })
  limit: number;
}

// 发货DTO
export class ShipOrderDto {
  @ApiProperty({
    description: '物流单号',
    example: 'SF1234567890',
  })
  @IsString()
  trackingNo: string;

  @ApiProperty({
    description: '物流公司',
    example: '顺丰速运',
  })
  @IsString()
  logisticsCompany: string;

  @ApiPropertyOptional({
    description: '备注',
    example: '已发货',
  })
  @IsOptional()
  @IsString()
  remark?: string;
}

// 批量发货DTO
export class BatchShipOrderDto {
  @ApiProperty({
    description: '订单ID列表',
    example: ['1', '2', '3'],
  })
  @IsArray()
  @IsString({ each: true })
  orderIds: string[];

  @ApiProperty({
    description: '物流单号',
    example: 'SF1234567890',
  })
  @IsString()
  trackingNo: string;

  @ApiProperty({
    description: '物流公司',
    example: '顺丰速运',
  })
  @IsString()
  logisticsCompany: string;

  @ApiPropertyOptional({
    description: '备注',
    example: '批量发货',
  })
  @IsOptional()
  @IsString()
  remark?: string;
}
