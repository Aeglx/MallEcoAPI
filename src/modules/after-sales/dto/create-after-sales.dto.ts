import { ApiProperty } from '@nestjs/swagger';
import { AfterSalesType } from '../entities/after-sales.entity';

export class CreateAfterSalesDto {
  @ApiProperty({ description: '订单ID', example: '1' })
  orderId: string;

  @ApiProperty({ description: '用户ID', example: '1' })
  userId: string;

  @ApiProperty({
    description: '售后服务类型',
    enum: AfterSalesType,
    example: AfterSalesType.REFUND,
  })
  type: AfterSalesType;

  @ApiProperty({ description: '商品ID', example: 1 })
  productId: number;

  @ApiProperty({ description: '商品SKU ID', example: 1 })
  productSkuId: number;

  @ApiProperty({ description: '商品名称', example: '测试商品' })
  productName: string;

  @ApiProperty({ description: '商品SKU名称', example: '测试商品 - 红色 - L' })
  productSkuName: string;

  @ApiProperty({ description: '商品单价', example: 99.99 })
  productPrice: number;

  @ApiProperty({ description: '申请数量', example: 1 })
  quantity: number;

  @ApiProperty({ description: '申请金额', example: 99.99 })
  totalAmount: number;

  @ApiProperty({ description: '退款金额', example: 99.99 })
  refundAmount: number;

  @ApiProperty({ description: '申请原因', example: '商品质量问题' })
  reason: string;

  @ApiProperty({ description: '详细描述', example: '商品收到后发现有质量问题', required: false })
  description?: string;

  @ApiProperty({
    description: '证据图片URL列表',
    example: ['https://example.com/image1.jpg'],
    required: false,
  })
  evidenceImages?: string[];
}
