import { ApiProperty } from '@nestjs/swagger';
import { AfterSalesStatus } from '../entities/after-sales.entity';

export class UpdateAfterSalesDto {
  @ApiProperty({ description: '售后服务状态', enum: AfterSalesStatus, required: false })
  status?: AfterSalesStatus;

  @ApiProperty({ description: '审核意见', required: false })
  reviewReason?: string;

  @ApiProperty({ description: '快递公司', required: false })
  shippingCompany?: string;

  @ApiProperty({ description: '快递单号', required: false })
  trackingNumber?: string;

  @ApiProperty({ description: '退款金额', required: false, example: 99.99 })
  refundAmount?: number;

  @ApiProperty({ description: '管理员ID', required: false })
  adminId?: number;
}
