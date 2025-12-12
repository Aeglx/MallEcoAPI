import { IsString, IsNumber, IsNotEmpty, IsOptional, IsDecimal, IsBoolean, IsDate, IsEnum } from 'class-validator';
import { PromotionType, PromotionStatus } from '../entities/promotion.entity';

export class CreatePromotionDto {
  @IsString({ message: '促销名称不能为空' })
  @IsNotEmpty()
  promotionName: string;

  @IsEnum(PromotionType, { message: '促销类型无效' })
  @IsNotEmpty()
  promotionType: PromotionType;

  @IsDate({ message: '开始时间不能为空' })
  @IsNotEmpty()
  startTime: Date;

  @IsDate({ message: '结束时间不能为空' })
  @IsNotEmpty()
  endTime: Date;

  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  minAmount?: number;

  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  reductionAmount?: number;

  @IsDecimal({ decimal_digits: '0,2' })
  @IsOptional()
  discountRate?: number;

  @IsDecimal({ decimal_digits: '0,2' })
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

  // 关联商品列表
  @IsOptional()
  promotionProducts?: Array<{
    productId: string;
    skuId?: string;
    promotionPrice?: number;
    stock?: number;
    isMain?: boolean;
  }>;

  // 关联会员列表
  @IsOptional()
  promotionMembers?: Array<{
    memberId: string;
    maxParticipate?: number;
  }>;
}
