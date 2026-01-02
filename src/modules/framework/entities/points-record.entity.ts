import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * 积分记录类型枚举
 */
export enum PointsRecordType {
  EARN = 'earn', // 获得
  CONSUME = 'consume', // 消耗
  REFUND = 'refund', // 退款
  ADJUST = 'adjust', // 调整（管理员）
}

/**
 * 积分记录来源枚举
 */
export enum PointsRecordSource {
  ORDER = 'order', // 订单
  EXCHANGE = 'exchange', // 积分兑换
  ACTIVITY = 'activity', // 活动
  SIGN = 'sign', // 签到
  ADMIN = 'admin', // 管理员调整
}

/**
 * 积分记录实体
 */
@Entity('points_record')
@Index(['memberId', 'createTime'])
@Index(['orderNo'])
export class PointsRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, comment: '会员ID' })
  memberId: string;

  @Column({ length: 50, nullable: true, comment: '会员用户名' })
  memberUsername: string;

  @Column({
    type: 'enum',
    enum: PointsRecordType,
    comment: '积分类型：earn-获得，consume-消耗，refund-退款，adjust-调整',
  })
  type: PointsRecordType;

  @Column({ type: 'int', comment: '积分数量（正数为增加，负数为减少）' })
  points: number;

  @Column({ type: 'int', comment: '操作后剩余积分' })
  balance: number;

  @Column({
    type: 'enum',
    enum: PointsRecordSource,
    comment: '积分来源',
  })
  source: PointsRecordSource;

  @Column({ length: 100, nullable: true, comment: '关联订单号' })
  orderNo: string;

  @Column({ length: 100, nullable: true, comment: '关联业务ID（如积分商品ID）' })
  businessId: string;

  @Column({ length: 200, nullable: true, comment: '业务描述' })
  businessDesc: string;

  @Column({ length: 500, nullable: true, comment: '备注说明' })
  remark: string;

  @Column({ length: 50, nullable: true, comment: '操作人ID（管理员调整时使用）' })
  operatorId: string;

  @Column({ length: 50, nullable: true, comment: '操作人名称' })
  operatorName: string;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;
}

