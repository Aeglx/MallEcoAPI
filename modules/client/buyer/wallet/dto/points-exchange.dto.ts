import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PointsExchangeDto {
  @ApiProperty({ description: '用户ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: '积分商品ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: '兑换数量' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: '收货信息', required: false })
  @IsOptional()
  deliveryInfo?: {
    name: string;
    phone: string;
    address: string;
    province: string;
    city: string;
    district: string;
    postalCode?: string;
  };

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}