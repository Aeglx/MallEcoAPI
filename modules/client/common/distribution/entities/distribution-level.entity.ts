import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('distribution_level')
export class DistributionLevel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'level_name', length: 64, comment: '等级名称' })
  levelName: string;

  @Column({ name: 'level', type: 'int', unique: true, comment: '等级' })
  level: number;

  @Column({ name: 'min_orders', type: 'int', default: 0, comment: '最少订单数' })
  minOrders: number;

  @Column({ name: 'min_sales', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '最少销售额' })
  minSales: number;

  @Column({ name: 'min_team', type: 'int', default: 0, comment: '最少团队人数' })
  minTeam: number;

  @Column({ name: 'min_direct', type: 'int', default: 0, comment: '最少直推人数' })
  minDirect: number;

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2, default: 0, comment: '佣金比例(%)' })
  commissionRate: number;

  @Column({ name: 'second_commission', type: 'decimal', precision: 5, scale: 2, default: 0, comment: '二级佣金比例(%)' })
  secondCommission: number;

  @Column({ name: 'third_commission', type: 'decimal', precision: 5, scale: 2, default: 0, comment: '三级佣金比例(%)' })
  thirdCommission: number;

  @Column({ name: 'self_buy_rate', type: 'decimal', precision: 5, scale: 2, default: 0, comment: '自购佣金比例(%)' })
  selfBuyRate: number;

  @Column({ name: 'cash_min_amount', type: 'decimal', precision: 10, scale: 2, default: 10, comment: '最低提现金额' })
  cashMinAmount: number;

  @Column({ name: 'cash_max_amount', type: 'decimal', precision: 10, scale: 2, default: 10000, comment: '最高提现金额' })
  cashMaxAmount: number;

  @Column({ name: 'cash_fee_rate', type: 'decimal', precision: 5, scale: 2, default: 0, comment: '提现手续费率(%)' })
  cashFeeRate: number;

  @Column({ name: 'cash_min_fee', type: 'decimal', precision: 10, scale: 2, default: 0, comment: '最低提现手续费' })
  cashMinFee: number;

  @Column({ name: 'auto_upgrade', type: 'tinyint', default: 1, comment: '是否自动升级：0-否，1-是' })
  autoUpgrade: number;

  @Column({ name: 'upgrade_days', type: 'int', default: 30, comment: '升级考察天数' })
  upgradeDays: number;

  @Column({ name: 'downgrade_days', type: 'int', default: 0, comment: '降级考察天数（0不降级）' })
  downgradeDays: number;

  @Column({ name: 'icon', length: 500, nullable: true, comment: '等级图标' })
  icon: string;

  @Column({ name: 'privileges', type: 'text', nullable: true, comment: '等级权益（JSON格式）' })
  privileges: string;

  @Column({ name: 'description', length: 500, nullable: true, comment: '等级描述' })
  description: string;

  @Column({ name: 'status', type: 'tinyint', default: 1, comment: '状态：0-禁用，1-启用' })
  status: number;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  @CreateDateColumn({ name: 'create_time', type: 'datetime', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', type: 'datetime', comment: '更新时间' })
  updateTime: Date;

  @Column({ name: 'delete_flag', type: 'tinyint', default: 0, comment: '删除标记：0-未删除，1-已删除' })
  deleteFlag: number;
}