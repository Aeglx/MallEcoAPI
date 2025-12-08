import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { Member } from './member.entity';

// 积分变动类型枚举
export enum PointsChangeType {
  INCREASE = 'increase', // 增加
  DECREASE = 'decrease', // 减少
}

// 积分变动原因枚举
export enum PointsChangeReason {
  REGISTER = 'register', // 注册
  PURCHASE = 'purchase', // 购物
  RECOMMEND = 'recommend', // 推荐
  REVIEW = 'review', // 评价
  BIRTHDAY = 'birthday', // 生日
  EXPIRE = 'expire', // 过期
  RETURN = 'return', // 退货
  EXCHANGE = 'exchange', // 兑换
  OTHER = 'other', // 其他
}

@Entity('member_points')
export class MemberPoints {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ comment: '会员ID' })
  memberId: string;

  @Column({ type: 'enum', enum: PointsChangeType, comment: '积分变动类型' })
  changeType: PointsChangeType;

  @Column({ type: 'enum', enum: PointsChangeReason, comment: '积分变动原因' })
  changeReason: PointsChangeReason;

  @Column({ type: 'int', comment: '变动积分' })
  changePoints: number;

  @Column({ type: 'int', comment: '变动前积分' })
  beforePoints: number;

  @Column({ type: 'int', comment: '变动后积分' })
  afterPoints: number;

  @Column({ length: 100, nullable: true, comment: '相关订单ID' })
  orderId: string;

  @Column({ length: 200, nullable: true, comment: '备注' })
  remark: string;

  @Column({ type: 'timestamp', nullable: true, comment: '积分过期时间' })
  expireTime: Date;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  // 关联会员
  @ManyToOne(() => Member, member => member.pointsRecords)
  @Index()
  member: Member;
}
