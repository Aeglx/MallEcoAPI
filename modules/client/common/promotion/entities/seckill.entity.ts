import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 秒杀活动实体
 */
@Entity('t_seckill')
export class Seckill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, comment: '活动名称' })
  name: string;

  @Column({ length: 20, unique: true, comment: '活动编码' })
  code: string;

  @Column({ type: 'datetime', comment: '活动开始时间' })
  startTime: Date;

  @Column({ type: 'datetime', comment: '活动结束时间' })
  endTime: Date;

  @Column({ type: 'datetime', comment: '预告开始时间' })
  previewStartTime: Date;

  @Column({ type: 'datetime', comment: '预告结束时间' })
  previewEndTime: Date;

  @Column({ type: 'int', default: 1, comment: '状态 0-未开始 1-进行中 2-已结束 3-已取消' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '活动描述' })
  description: string;

  @Column({ length: 500, nullable: true, comment: '分享标题' })
  shareTitle: string;

  @Column({ type: 'text', nullable: true, comment: '分享图片' })
  shareImage: string;

  @Column({ type: 'text', nullable: true, comment: '分享描述' })
  shareDescription: string;

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
}

/**
 * 秒杀商品实体
 */
@Entity('t_seckill_goods')
export class SeckillGoods {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36, comment: '秒杀活动ID' })
  seckillId: string;

  @Column({ length: 36, comment: '商品ID' })
  productId: string;

  @Column({ length: 100, comment: '商品名称' })
  productName: string;

  @Column({ type: 'text', nullable: true, comment: '商品图片' })
  productImage: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '原价' })
  originalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '秒杀价' })
  seckillPrice: number;

  @Column({ type: 'int', default: 0, comment: '秒杀库存' })
  seckillStock: number;

  @Column({ type: 'int', default: 0, comment: '已售数量' })
  soldCount: number;

  @Column({ type: 'int', default: 0, comment: '每人限购数量(0表示不限购)' })
  limitCount: number;

  @Column({ type: 'int', default: 1, comment: '排序' })
  sortOrder: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @Column({ type: 'int', default: 0, comment: '删除标识 0-未删除 1-已删除' })
  deleteFlag: number;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}