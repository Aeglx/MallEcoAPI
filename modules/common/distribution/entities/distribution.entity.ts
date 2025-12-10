import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Member } from '../../member/entities/member.entity';
import { DistributionOrder } from './distribution-order.entity';
import { DistributionGoods } from './distribution-goods.entity';

@Entity('distribution')
@Index(['memberId'])
@Index(['status'])
@Index(['level'])
export class Distribution {
  @PrimaryGeneratedColumn('bigint')
  id: string;

  @Column({ name: 'member_id', type: 'bigint', comment: '会员ID' })
  memberId: string;

  @Column({ name: 'distribution_code', type: 'varchar', length: 32, unique: true, comment: '分销员编号' })
  distributionCode: string;

  @Column({ name: 'parent_id', type: 'bigint', nullable: true, comment: '上级分销员ID' })
  parentId: string;

  @Column({ name: 'level', type: 'int', default: 1, comment: '分销员等级' })
  level: number;

  @Column({ name: 'team_count', type: 'int', default: 0, comment: '团队人数' })
  teamCount: number;

  @Column({ name: 'direct_count', type: 'int', default: 0, comment: '直推人数' })
  directCount: number;

  @Column({ name: 'total_commission', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '累计佣金' })
  totalCommission: number;

  @Column({ name: 'available_commission', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '可提现佣金' })
  availableCommission: number;

  @Column({ name: 'frozen_commission', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '冻结佣金' })
  frozenCommission: number;

  @Column({ name: 'total_order_amount', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '累计订单金额' })
  totalOrderAmount: number;

  @Column({ name: 'month_order_amount', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '本月订单金额' })
  monthOrderAmount: number;

  @Column({ name: 'total_order_count', type: 'int', default: 0, comment: '累计订单数量' })
  totalOrderCount: number;

  @Column({ name: 'month_order_count', type: 'int', default: 0, comment: '本月订单数量' })
  monthOrderCount: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'disabled'],
    default: 'pending',
    comment: '状态：pending-待审核，approved-已通过，rejected-已拒绝，disabled-已禁用'
  })
  status: string;

  @Column({ name: 'apply_time', type: 'datetime', nullable: true, comment: '申请时间' })
  applyTime: Date;

  @Column({ name: 'audit_time', type: 'datetime', nullable: true, comment: '审核时间' })
  auditTime: Date;

  @Column({ name: 'audit_user_id', type: 'bigint', nullable: true, comment: '审核人ID' })
  auditUserId: string;

  @Column({ name: 'audit_remark', type: 'text', nullable: true, comment: '审核备注' })
  auditRemark: string;

  @Column({ name: 'disabled_time', type: 'datetime', nullable: true, comment: '禁用时间' })
  disabledTime: Date;

  @Column({ name: 'disabled_reason', type: 'text', nullable: true, comment: '禁用原因' })
  disabledReason: string;

  // 关联关系
  @ManyToOne(() => Member, member => member.distributions)
  member: Member;

  @ManyToOne(() => Distribution, distribution => distribution.children)
  parent: Distribution;

  @OneToMany(() => Distribution, distribution => distribution.parent)
  children: Distribution[];

  @OneToMany(() => DistributionOrder, order => order.distribution)
  orders: DistributionOrder[];

  @OneToMany(() => DistributionGoods, goods => goods.distribution)
  goods: DistributionGoods[];

  @CreateDateColumn({ name: 'create_time', type: 'datetime', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', type: 'datetime', comment: '更新时间' })
  updateTime: Date;
}