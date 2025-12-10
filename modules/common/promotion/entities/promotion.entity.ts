import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 营销活动实体
 */
@Entity('t_promotion')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, comment: '活动名称' })
  name: string;

  @Column({ type: 'int', comment: '活动类型 1-优惠券活动 2-满减活动 3-秒杀活动 4-拼团活动 5-积分兑换 6-签到活动 7-推荐有礼' })
  type: number;

  @Column({ type: 'datetime', comment: '活动开始时间' })
  startTime: Date;

  @Column({ type: 'datetime', comment: '活动结束时间' })
  endTime: Date;

  @Column({ type: 'int', default: 1, comment: '状态 0-禁用 1-启用' })
  status: number;

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

  @Column({ type: 'int', default: 0, comment: '删除标志 0-未删除 1-已删除' })
  deleteFlag: number;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
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

  @Column({ type: 'int', default: 0, comment: '删除标志 0-未删除 1-已删除' })
  deleteFlag: number;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}