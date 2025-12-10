import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 满减活动实体
 */
@Entity('t_full_discount')
export class FullDiscount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, comment: '活动名称' })
  name: string;

  @Column({ type: 'int', comment: '活动类型 1-满减 2-满折 3-满赠' })
  type: number;

  @Column({ type: 'int', comment: '适用范围 0-全场通用 1-指定商品 2-指定分类 3-指定品牌' })
  useRange: number;

  @Column({ type: 'text', nullable: true, comment: '适用范围ID列表，JSON格式' })
  useRangeIds: string;

  @Column({ type: 'datetime', comment: '活动开始时间' })
  startTime: Date;

  @Column({ type: 'datetime', comment: '活动结束时间' })
  endTime: Date;

  @Column({ type: 'int', default: 1, comment: '状态 0-禁用 1-启用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '活动描述' })
  description: string;

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
 * 满减活动规则实体
 */
@Entity('t_full_discount_rule')
export class FullDiscountRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36, comment: '满减活动ID' })
  fullDiscountId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '满额条件' })
  fullAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '减额/折扣/赠品价值' })
  value: number;

  @Column({ type: 'int', default: 0, comment: '层级 1-第一级 2-第二级 以此类推' })
  level: number;

  @Column({ type: 'int', default: 0, comment: '是否重复享受 0-否 1-是' })
  isRepeat: number;

  @Column({ type: 'text', nullable: true, comment: '赠品ID列表（满赠类型时使用）' })
  giftIds: string;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;

  @Column({ type: 'int', default: 0, comment: '删除标志 0-未删除 1-已删除' })
  deleteFlag: number;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}