import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderDto {
  @ApiProperty({
    description: '订单状态',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  orderStatus?: number;

  @ApiProperty({
    description: '支付状态',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  payStatus?: number;

  @ApiProperty({
    description: '发货状态',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  shipStatus?: number;

  @ApiProperty({
    description: '支付方式',
    example: 'wechat',
    required: false,
  })
  @IsOptional()
  @IsString()
  payType?: string;

  @ApiProperty({
    description: '支付时间',
    example: '2024-01-01T12:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  payTime?: string;

  @ApiProperty({
    description: '发货时间',
    example: '2024-01-02T12:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  shipTime?: string;

  @ApiProperty({
    description: '收货时间',
    example: '2024-01-05T12:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  receiveTime?: string;

  @ApiProperty({
    description: '取消时间',
    example: '2024-01-01T13:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  cancelTime?: string;

  @ApiProperty({
    description: '物流单号',
    example: 'SF1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  trackingNo?: string;

  @ApiProperty({
    description: '物流公司',
    example: '顺丰快递',
    required: false,
  })
  @IsOptional()
  @IsString()
  logisticsCompany?: string;

  @ApiProperty({
    description: '订单备注',
    example: '请尽快发货',
    required: false,
  })
  @IsOptional()
  @IsString()
  remark?: string;
}
