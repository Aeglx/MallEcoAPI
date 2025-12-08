import { Entity, Column, Index, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../common/base.entity';
import { PromotionProduct } from './promotion-product.entity';
import { PromotionMember } from './promotion-member.entity';
import { Order } from '../../order/entities/order.entity';

export enum PromotionType {
  /** 满减 */
  FULL_REDUCTION = 0,
  /** 折扣 */
  DISCOUNT = 1,
  /** 秒杀 */
  FLASH_SALE = 2,
  /** 团购 */
  GROUP_BUY = 3,
  /** 赠品 */
  GIFT = 4,
  /** 优惠券 */
  COUPON = 5,
}

export enum PromotionStatus {
  /** 未开始 */
  NOT_STARTED = 0,
  /** 进行中 */
  ONGOING = 1,
  /** 已结束 */
  ENDED = 2,
  /** 已暂停 */
  PAUSED = 3,
}

@Entity('mall_promotion')
@Index(['promotionName'])
@Index(['promotionType'])
@Index(['promotionStatus'])
@Index(['startTime'])
@Index(['endTime'])
export class Promotion extends BaseEntity {
  @Column({ length: 50, name: 'promotion_name' })
  promotionName: string;

  @Column({ name: 'promotion_type' })
  promotionType: PromotionType;

  @Column({ name: 'promotion_status' })
  promotionStatus: PromotionStatus;

  @Column({ name: 'start_time', type: 'datetime' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime' })
  endTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'min_amount', nullable: true })
  minAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'reduction_amount', nullable: true })
  reductionAmount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, name: 'discount_rate', nullable: true })
  discountRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'max_discount', nullable: true })
  maxDiscount: number;

  @Column({ type: 'int', name: 'limit_num', nullable: true })
  limitNum: number;

  @Column({ type: 'int', name: 'buy_limit', nullable: true })
  buyLimit: number;

  @Column({ type: 'int', name: 'total_stock', nullable: true })
  totalStock: number;

  @Column({ type: 'int', name: 'used_stock', nullable: true })
  usedStock: number;

  @Column({ length: 255, name: 'promotion_rules', nullable: true })
  promotionRules: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string;

  @Column({ type: 'boolean', name: 'is_repeat', default: false })
  isRepeat: boolean;

  @Column({ type: 'boolean', name: 'is_auto_start', default: false })
  isAutoStart: boolean;

  @Column({ type: 'boolean', name: 'is_deleted', default: false })
  isDeleted: boolean;

  // 关联关系
  @OneToMany(() => PromotionProduct, (promotionProduct) => promotionProduct.promotion)
  promotionProducts: PromotionProduct[];

  @OneToMany(() => PromotionMember, (promotionMember) => promotionMember.promotion)
  promotionMembers: PromotionMember[];
}
