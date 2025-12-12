import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../../common/base.entity';
import { Promotion } from './promotion.entity';

@Entity('mall_promotion_member')
@Index(['promotionId', 'memberId'], { unique: true })
@Index(['memberId'])
@Index(['promotionId'])
export class PromotionMember extends BaseEntity {
  @Column({ length: 32, name: 'promotion_id' })
  promotionId: string;

  @Column({ length: 32, name: 'member_id' })
  memberId: string;

  @Column({ type: 'int', name: 'participate_count', default: 0 })
  participateCount: number;

  @Column({ type: 'int', name: 'max_participate', default: 1 })
  maxParticipate: number;

  @Column({ type: 'boolean', name: 'is_qualified', default: true })
  isQualified: boolean;

  @Column({ name: 'qualified_time', type: 'datetime', nullable: true })
  qualifiedTime: Date;

  // 鍏宠仈鍏崇郴
  @ManyToOne(() => Promotion, (promotion) => promotion.promotionMembers, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'promotion_id' })
  promotion: Promotion;
}





