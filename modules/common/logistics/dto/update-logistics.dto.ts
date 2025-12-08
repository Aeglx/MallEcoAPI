import { IsString, IsEnum, IsOptional, IsDecimal, IsDateString } from 'class-validator';
import { LogisticsCompany, LogisticsStatus } from '../entities/logistics.entity';

export class UpdateLogisticsDto {
  @IsEnum(LogisticsCompany, { message: '物流公司无效' })
  @IsOptional()
  logisticsCompany?: LogisticsCompany;

  @IsString({ message: '物流单号不能为空' })
  @IsOptional()
  logisticsNo?: string;

  @IsEnum(LogisticsStatus, { message: '物流状态无效' })
  @IsOptional()
  logisticsStatus?: LogisticsStatus;

  @IsString({ message: '发件人姓名不能为空' })
  @IsOptional()
  senderName?: string;

  @IsString({ message: '发件人电话不能为空' })
  @IsOptional()
  senderPhone?: string;

  @IsString({ message: '发件人地址不能为空' })
  @IsOptional()
  senderAddress?: string;

  @IsString({ message: '收件人姓名不能为空' })
  @IsOptional()
  receiverName?: string;

  @IsString({ message: '收件人电话不能为空' })
  @IsOptional()
  receiverPhone?: string;

  @IsString({ message: '收件人地址不能为空' })
  @IsOptional()
  receiverAddress?: string;

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

  @IsDateString({}, { message: '实际送达时间格式无效' })
  @IsOptional()
  actualDeliveryTime?: string;

  @IsString({ message: '物流追踪URL格式无效' })
  @IsOptional()
  trackingUrl?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}
