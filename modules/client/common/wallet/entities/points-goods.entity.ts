import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 积分商品实体
 */
@Entity('t_points_goods')
export class PointsGoods {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36, comment: '商品ID（关联商品表）' })
  productId: string;

  @Column({ length: 100, comment: '商品名称' })
  productName: string;

  @Column({ type: 'text', nullable: true, comment: '商品图片' })
  productImage: string;

  @Column({ type: 'int', default: 0, comment: '兑换所需积分' })
  points: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '商品价值' })
  value: number;

  @Column({ type: 'int', default: 0, comment: '库存数量' })
  stock: number;

  @Column({ type: 'int', default: 0, comment: '已兑换数量' })
  exchangedCount: number;

  @Column({ type: 'int', default: 1, comment: '每人限兑数量 0表示不限制' })
  limitCount: number;

  @Column({ type: 'datetime', nullable: true, comment: '兑换开始时间' })
  exchangeStartTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '兑换结束时间' })
  exchangeEndTime: Date;

  @Column({ type: 'int', default: 1, comment: '状态 0-下架 1-上架' })
  status: number;

  @Column({ type: 'int', default: 0, comment: '是否热门 0-否 1-是' })
  isHot: number;

  @Column({ type: 'int', default: 0, comment: '是否推荐 0-否 1-是' })
  isRecommend: number;

  @Column({ type: 'int', default: 1, comment: '排序' })
  sortOrder: number;

  @Column({ type: 'datetime', nullable: true, comment: '上架时间' })
  onlineTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '下架时间' })
  offlineTime: Date;

  @Column({ type: 'text', nullable: true, comment: '兑换说明' })
  exchangeDescription: string;

  @Column({ type: 'text', nullable: true, comment: '商品描述' })
  description: string;

  @Column({ type: 'text', nullable: true, comment: '兑换须知' })
  exchangeNotice: string;

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
 * 积分兑换记录实体
 */
@Entity('t_points_exchange')
export class PointsExchange {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36, comment: '会员ID' })
  memberId: string;

  @Column({ length: 50, comment: '会员名称' })
  memberName: string;

  @Column({ length: 36, comment: '积分商品ID' })
  pointsGoodsId: string;

  @Column({ length: 100, comment: '商品名称' })
  productName: string;

  @Column({ type: 'text', nullable: true, comment: '商品图片' })
  productImage: string;

  @Column({ type: 'int', comment: '消耗积分' })
  points: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '商品价值' })
  value: number;

  @Column({ type: 'int', default: 1, comment: '兑换数量' })
  quantity: number;

  @Column({ type: 'int', default: 0, comment: '兑换状态 0-待发货 1-已发货 2-已收货 3-已完成 4-已取消' })
  status: number;

  @Column({ length: 50, unique: true, comment: '兑换单号' })
  exchangeNo: string;

  @Column({ type: 'text', nullable: true, comment: '收货信息，JSON格式' })
  shippingInfo: string;

  @Column({ type: 'text', nullable: true, comment: '物流信息，JSON格式' })
  logisticsInfo: string;

  @Column({ type: 'datetime', nullable: true, comment: '发货时间' })
  shipTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '收货时间' })
  receiveTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '完成时间' })
  completeTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '取消时间' })
  cancelTime: Date;

  @Column({ type: 'text', nullable: true, comment: '取消原因' })
  cancelReason: string;

  @Column({ length: 200, nullable: true, comment: '备注' })
  remark: string;

  @Column({ type: 'int', default: 0, comment: '删除标志 0-未删除 1-已删除' })
  deleteFlag: number;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}