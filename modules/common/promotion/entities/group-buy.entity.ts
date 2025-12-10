import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 拼团活动实体
 */
@Entity('t_group_buy')
export class GroupBuy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, comment: '活动名称' })
  name: string;

  @Column({ type: 'datetime', comment: '活动开始时间' })
  startTime: Date;

  @Column({ type: 'datetime', comment: '活动结束时间' })
  endTime: Date;

  @Column({ type: 'int', default: 1, comment: '状态 0-未开始 1-进行中 2-已结束 3-已取消' })
  status: number;

  @Column({ type: 'int', default: 0, comment: '有效时长（小时）' })
  validHours: number;

  @Column({ type: 'int', default: 0, comment: '每人限购数量 0表示不限制' })
  limitCount: number;

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

  @Column({ type: 'int', default: 0, comment: '删除标志 0-未删除 1-已删除' })
  deleteFlag: number;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}

/**
 * 拼团商品实体
 */
@Entity('t_group_buy_goods')
export class GroupBuyGoods {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36, comment: '拼团活动ID' })
  groupBuyId: string;

  @Column({ length: 36, comment: '商品ID' })
  productId: string;

  @Column({ length: 100, comment: '商品名称' })
  productName: string;

  @Column({ type: 'text', nullable: true, comment: '商品图片' })
  productImage: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '原价' })
  originalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '拼团价' })
  groupBuyPrice: number;

  @Column({ type: 'int', default: 0, comment: '成团人数' })
  groupCount: number;

  @Column({ type: 'int', default: 0, comment: '库存' })
  stock: number;

  @Column({ type: 'int', default: 0, comment: '已售数量' })
  soldCount: number;

  @Column({ type: 'int', default: 1, comment: '排序' })
  sortOrder: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @Column({ type: 'int', default: 0, comment: '删除标志 0-未删除 1-已删除' })
  deleteFlag: number;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}

/**
 * 拼团订单实体
 */
@Entity('t_group_buy_order')
export class GroupBuyOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36, comment: '拼团商品ID' })
  groupBuyGoodsId: string;

  @Column({ length: 36, comment: '主订单ID（团长订单）' })
  mainOrderId: string;

  @Column({ length: 36, comment: '当前订单ID' })
  orderId: string;

  @Column({ length: 50, comment: '订单编号' })
  orderNo: string;

  @Column({ length: 36, comment: '会员ID' })
  memberId: string;

  @Column({ length: 50, comment: '会员名称' })
  memberName: string;

  @Column({ length: 36, comment: '父订单ID（团员订单的团长订单ID）' })
  parentId: string;

  @Column({ type: 'int', default: 1, comment: '拼团角色 1-团长 2-团员' })
  role: number;

  @Column({ type: 'int', default: 1, comment: '拼团状态 1-待成团 2-已成团 3-拼团失败 4-已取消' })
  status: number;

  @Column({ type: 'datetime', nullable: true, comment: '成团时间' })
  successTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '失效时间' })
  expireTime: Date;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @Column({ type: 'int', default: 0, comment: '删除标志 0-未删除 1-已删除' })
  deleteFlag: number;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}