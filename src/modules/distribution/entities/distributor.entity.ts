import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../../common/base.entity';

@Entity('mall_distributor')
export class Distributor extends BaseEntity {
  @Index('idx_user_id')
  @Column({ name: 'user_id', length: 36, nullable: false, comment: '用户ID' })
  userId: string;

  @Column({ name: 'distributor_name', length: 50, nullable: false, comment: '分销商名称' })
  distributorName: string;

  @Column({ name: 'distributor_level', type: 'tinyint', default: 0, comment: '分销商等级：0-普通分销商，1-高级分销商，2-顶级分销商' })
  distributorLevel: number;

  @Column({ name: 'inviter_id', length: 36, nullable: true, comment: '邀请人ID' })
  inviterId: string;

  @Column({ name: 'total_sales', type: 'decimal', precision: 15, scale: 2, default: 0, comment: '总销售额' })
  totalSales: number;

  @Column({ name: 'total_commission', type: 'decimal', precision: 15, scale: 2, default: 0, comment: '总佣金' })
  totalCommission: number;

  @Column({ name: 'available_commission', type: 'decimal', precision: 15, scale: 2, default: 0, comment: '可用佣金' })
  availableCommission: number;

  @Column({ name: 'frozen_commission', type: 'decimal', precision: 15, scale: 2, default: 0, comment: '冻结佣金' })
  frozenCommission: number;

  @Column({ name: 'status', type: 'tinyint', default: 0, comment: '状态：0-待审核，1-已通过，2-已拒绝，3-已冻结' })
  status: number;

  @Column({ name: 'audit_time', type: 'datetime', nullable: true, comment: '审核时间' })
  auditTime: Date;

  @Column({ name: 'audit_note', type: 'varchar', length: 255, nullable: true, comment: '审核备注' })
  auditNote: string;
}
