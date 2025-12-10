import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 会员积分实体
 */
@Entity('t_points')
export class Points {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36, comment: '会员ID' })
  memberId: string;

  @Column({ length: 50, comment: '会员名称' })
  memberName: string;

  @Column({ type: 'int', default: 0, comment: '当前积分余额' })
  balance: number;

  @Column({ type: 'int', default: 0, comment: '累计获得积分' })
  totalEarned: number;

  @Column({ type: 'int', default: 0, comment: '累计消费积分' })
  totalSpent: number;

  @Column({ type: 'int', default: 0, comment: '累计过期积分' })
  totalExpired: number;

  @Column({ type: 'int', default: 0, comment: '本年度获得积分' })
  yearEarned: number;

  @Column({ type: 'int', default: 0, comment: '本月获得积分' })
  monthEarned: number;

  @Column({ type: 'datetime', nullable: true, comment: '最后变动时间' })
  lastChangeTime: Date;

  @Column({ type: 'int', default: 0, comment: '积分等级' })
  level: number;

  @Column({ type: 'int', default: 0, comment: '删除标志 0-未删除 1-已删除' })
  deleteFlag: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}

/**
 * 积分流水记录实体
 */
@Entity('t_points_record')
export class PointsRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36, comment: '会员ID' })
  memberId: string;

  @Column({ length: 50, comment: '会员名称' })
  memberName: string;

  @Column({ type: 'int', comment: '变动类型 1-注册奖励 2-签到奖励 3-消费返积分 4-兑换消费 5-活动奖励 6-推荐奖励 7-积分过期 8-管理员调整' })
  type: number;

  @Column({ type: 'int', comment: '变动方向 1-收入 2-支出' })
  direction: number;

  @Column({ type: 'int', default: 0, comment: '变动积分数' })
  points: number;

  @Column({ type: 'int', default: 0, comment: '变动前余额' })
  beforeBalance: number;

  @Column({ type: 'int', default: 0, comment: '变动后余额' })
  afterBalance: number;

  @Column({ type: 'datetime', nullable: true, comment: '积分过期时间' })
  expireTime: Date;

  @Column({ length: 50, nullable: true, comment: '关联业务类型' })
  businessType: string;

  @Column({ length: 36, nullable: true, comment: '关联业务ID' })
  businessId: string;

  @Column({ length: 100, nullable: true, comment: '关联业务编号' })
  businessNo: string;

  @Column({ length: 200, nullable: true, comment: '变动说明' })
  description: string;

  @Column({ type: 'int', default: 0, comment: '记录状态 0-有效 1-已过期 2-已取消' })
  status: number;

  @Column({ type: 'datetime', nullable: true, comment: '过期时间' })
  invalidTime: Date;

  @Column({ length: 36, nullable: true, comment: '操作人ID' })
  operatorId: string;

  @Column({ length: 50, nullable: true, comment: '操作人名称' })
  operatorName: string;

  @Column({ type: 'int', default: 0, comment: '删除标志 0-未删除 1-已删除' })
  deleteFlag: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}