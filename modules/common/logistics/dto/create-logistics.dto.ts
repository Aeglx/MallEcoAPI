import { IsString, IsEnum, IsOptional, IsDecimal, IsDateString } from 'class-validator';
import { LogisticsCompany, LogisticsStatus } from '../entities/logistics.entity';

export class CreateLogisticsDto {
  @IsString({ message: '订单ID不能为空' })
  orderId: string;

  @IsEnum(LogisticsCompany, { message: '物流公司无效' })
  logisticsCompany: LogisticsCompany;

  @IsString({ message: '物流单号不能为空' })
  logisticsNo: string;

  @IsEnum(LogisticsStatus, { message: '物流状态无效' })
  @IsOptional()
  logisticsStatus?: LogisticsStatus;

  @IsString({ message: '发件人姓名不能为空' })
  senderName: string;

  @IsString({ message: '发件人电话不能为空' })
  senderPhone: string;

  @IsString({ message: '发件人地址不能为空' })
  senderAddress: string;

  @IsString({ message: '收件人姓名不能为空' })
  receiverName: string;

  @IsString({ message: '收件人电话不能为空' })
  receiverPhone: string;

  @IsString({ message: '收件人地址不能为空' })
  receiverAddress: string;

  @IsDecimal({ decimal_digits: '0,2', message: '重量必须是有效的数字' })
  @IsOptional()
  weight?: number;

  @IsDecimal({ decimal_digits: '0,2', message: '体积必须是有效的数字' })
  @IsOptional()
  volume?: number;

  @IsDecimal({ decimal_digits: '0,2', message: '配送费必须是有效的数字' })
  @IsOptional()
  deliveryFee?: number;

  @IsDateString({}, { message: '预计送达时间格式无效' })
  @IsOptional()
  estimatedDeliveryTime?: string;

  @IsString({ message: '物流追踪URL格式无效' })
  @IsOptional()
  trackingUrl?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}
