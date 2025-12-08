import { IsString, IsNumber, IsOptional, IsDecimal, IsBoolean, IsDate, IsEnum } from 'class-validator';
import { PromotionType, PromotionStatus } from '../entities/promotion.entity';

export class UpdatePromotionDto {
  @IsString({ message: '促销名称不能为空' })
  @IsOptional()
  promotionName?: string;

  @IsEnum(PromotionType, { message: '促销类型无效' })
  @IsOptional()
  promotionType?: PromotionType;

  @IsEnum(PromotionStatus, { message: '促销状态无效' })
  @IsOptional()
  promotionStatus?: PromotionStatus;

  @IsDate({ message: '开始时间格式无效' })
  @IsOptional()
  startTime?: Date;

  @IsDate({ message: '结束时间格式无效' })
  @IsOptional()
  endTime?: Date;

  @IsDecimal({ decimal_digits: '0,2', message: '满减金额必须是有效的数字' })
  @IsOptional()
  minAmount?: number;

  @IsDecimal({ decimal_digits: '0,2', message: '减免金额必须是有效的数字' })
  @IsOptional()
  reductionAmount?: number;

  @IsDecimal({ decimal_digits: '0,2', message: '折扣率必须是有效的数字' })
  @IsOptional()
  discountRate?: number;

  @IsDecimal({ decimal_digits: '0,2', message: '最大优惠金额必须是有效的数字' })
  @IsOptional()
  maxDiscount?: number;

  @IsNumber({}, { message: '每人限制数量必须是有效的数字' })
  @IsOptional()
  limitNum?: number;

  @IsNumber({}, { message: '购买限制必须是有效的数字' })
  @IsOptional()
  buyLimit?: number;

  @IsNumber({}, { message: '总库存必须是有效的数字' })
  @IsOptional()
  totalStock?: number;

  @IsString()
  @IsOptional()
  promotionRules?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isRepeat?: boolean;

  @IsBoolean()
  @IsOptional()
  isAutoStart?: boolean;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}
