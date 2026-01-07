import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 积分订单状态枚举
 */
export enum PointsOrderStatus {
  PENDING = 'pending', // 待发货
  SHIPPED = 'shipped', // 已发货
  COMPLETED = 'completed', // 已完成
  CANCELLED = 'cancelled', // 已取消
  REFUNDED = 'refunded', // 已退款
}

/**
 * 积分订单实体
 */
@Entity('points_order')
export class PointsOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true, comment: '订单号' })
  orderNo: string;

  @Column({ length: 100, comment: '会员ID' })
  memberId: string;

  @Column({ length: 50, nullable: true, comment: '会员用户名' })
  memberUsername: string;

  @Column({ length: 100, comment: '积分商品ID' })
  goodsId: string;

  @Column({ length: 100, comment: '商品名称' })
  goodsName: string;

  @Column({ length: 500, nullable: true, comment: '商品图片' })
  goodsImage: string;

  @Column({ type: 'int', comment: '兑换数量' })
  quantity: number;

  @Column({ type: 'int', comment: '消耗积分' })
  points: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0, comment: '现金金额' })
  cashAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0, comment: '订单总金额（积分+现金）' })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: PointsOrderStatus,
    default: PointsOrderStatus.PENDING,
    comment: '订单状态',
  })
  status: PointsOrderStatus;

  @Column({ length: 50, comment: '收货人姓名' })
  consignee: string;

  @Column({ length: 20, comment: '收货人电话' })
  phone: string;

  @Column({ length: 100, comment: '省份' })
  province: string;

  @Column({ length: 100, comment: '城市' })
  city: string;

  @Column({ length: 100, nullable: true, comment: '区县' })
  district: string;

  @Column({ type: 'text', comment: '详细地址' })
  detailAddress: string;

  @Column({ length: 10, nullable: true, comment: '邮政编码' })
  postalCode: string;

  @Column({ length: 50, nullable: true, comment: '物流公司' })
  logisticsCompany: string;

  @Column({ length: 100, nullable: true, comment: '物流单号' })
  logisticsNo: string;

  @Column({ type: 'datetime', nullable: true, comment: '发货时间' })
  shipTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '完成时间' })
  completeTime: Date;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @Column({ type: 'text', nullable: true, comment: '取消原因' })
  cancelReason: string;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;

  @Column({ default: false, comment: '是否删除' })
  deleted: boolean;
}
