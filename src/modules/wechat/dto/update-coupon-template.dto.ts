import { PartialType } from '@nestjs/swagger';
import { CreateCouponTemplateDto } from './create-coupon-template.dto';

export class UpdateCouponTemplateDto extends PartialType(CreateCouponTemplateDto) {}