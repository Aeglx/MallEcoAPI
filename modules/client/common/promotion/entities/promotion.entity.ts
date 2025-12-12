import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

/**
 * 促销类型枚举
 */
export enum PromotionType {
  FULL_REDUCTION = 1, // 满减
  DISCOUNT = 2, // 折扣
  FLASH_SALE = 3, // 秒杀
  GROUP_BUY = 4, // 团购
}

/**
 * 促销状态枚举
 */
export enum PromotionStatus {
  NOT_STARTED = 1, // 未开始
  ONGOING = 2, // 进行中
  PAUSED = 3, // 暂停
  ENDED = 4, // 已结束
}

/**
 * 促销活动实体
 */
@Entity('t_promotion')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, comment: '活动名称' })
  name: string;

  @Column({ type: 'int', comment: '活动类型 1-促销满减活动 2-满赠活动 3-秒杀活动 4-拼团活动 5-积分兑换 6-降价活动 7-推荐有礼' })
  type: number;

  @Column({ type: 'int', comment: '促销类型 1-满减 2-折扣 3-秒杀 4-团购' })
  promotionType: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '最低金额' })
  minAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '减免金额' })
  reductionAmount: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 1, comment: '折扣率' })
  discountRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '最大折扣' })
  maxDiscount: number;

  @Column({ type: 'datetime', comment: '活动开始时间' })
  startTime: Date;

  @Column({ type: 'datetime', comment: '活动结束时间' })
  endTime: Date;

  @Column({ type: 'int', default: 1, comment: '状态 0-禁用 1-启用' })
  status: number;

  @Column({ type: 'int', default: 1, comment: '促销状态 1-未开始 2-进行中 3-暂停 4-已结束' })
  promotionStatus: number;

  @Column({ type: 'int', default: 0, comment: '已使用库存' })
  usedStock: number;

  @Column({ type: 'text', nullable: true, comment: '活动描述' })
  description: string;

  @Column({ type: 'text', nullable: true, comment: '活动规则，JSON格式' })
  rules: string;

  @Column({ length: 500, nullable: true, comment: '活动图片' })
  image: string;

  @Column({ length: 100, nullable: true, comment: '活动链接' })
  link: string;

  @Column({ length: 100, nullable: true, comment: '活动标签' })
  tags: string;

  @Column({ type: 'int', default: 1, comment: '排序' })
  sortOrder: number;

  @Column({ type: 'int', default: 0, comment: '参与人数' })
  participantCount: number;

  @Column({ type: 'int', default: 0, comment: '访问量' })
  viewCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '活动预算' })
  budget: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '已花费' })
  spentAmount: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;

  @Column({ length: 50, nullable: true, comment: '创建人' })
  createBy: string;

  @Column({ length: 50, nullable: true, comment: '更新人' })
  updateBy: string;

  @Column({ type: 'int', default: 0, comment: '删除标识 0-未删除 1-已删除' })
  deleteFlag: number;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;

  // 关联促销商品
  @OneToMany(() => import('./promotion-product.entity').PromotionProduct, (promotionProduct: import('./promotion-product.entity').PromotionProduct) => promotionProduct.promotion)
  promotionProducts: import('./promotion-product.entity').PromotionProduct[];

  // 关联促销会员
  @OneToMany(() => import('./promotion-member.entity').PromotionMember, (promotionMember: import('./promotion-member.entity').PromotionMember) => promotionMember.promotion)
  promotionMembers: import('./promotion-member.entity').PromotionMember[];
}

/**
 * 活动参与记录实体
 */
@Entity('t_promotion_participant')
export class PromotionParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36, comment: '活动ID' })
  promotionId: string;

  @Column({ length: 36, comment: '会员ID' })
  memberId: string;

  @Column({ length: 50, comment: '会员名称' })
  memberName: string;

  @Column({ type: 'int', default: 1, comment: '参与状态 1-已参与 2-已完成 3-已取消' })
  status: number;

  @Column({ type: 'datetime', nullable: true, comment: '参与时间' })
  participateTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '完成时间' })
  completeTime: Date;

  @Column({ type: 'text', nullable: true, comment: '参与数据，JSON格式' })
  data: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '获得奖励' })
  rewardAmount: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @Column({ type: 'int', default: 0, comment: '删除标识 0-未删除 1-已删除' })
  deleteFlag: number;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}