import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('user_statistics')
@Index(['statDate', 'userType'])
@Index(['statDate', 'source'])
export class UserStatistics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', comment: '统计日期' })
  statDate: string;

  @Column({ type: 'varchar', length: 20, default: 'buyer', comment: '用户类型: buyer, seller' })
  userType: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '用户来源' })
  source: string;

  @Column({ type: 'int', default: 0, comment: '新增用户数' })
  newUsers: number;

  @Column({ type: 'int', default: 0, comment: '活跃用户数' })
  activeUsers: number;

  @Column({ type: 'int', default: 0, comment: '总用户数' })
  totalUsers: number;

  @Column({ type: 'int', default: 0, comment: '登录用户数' })
  loginUsers: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, comment: '留存率' })
  retentionRate: number;

  @Column({ type: 'int', default: 0, comment: '流失用户数' })
  churnedUsers: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, comment: '流失率' })
  churnRate: number;

  @Column({ type: 'int', default: 0, comment: '平均在线时长(分钟)' })
  avgOnlineTime: number;

  @Column({ type: 'varchar', length: 50, default: 'daily', comment: '统计粒度: daily, weekly, monthly' })
  granularity: string;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date;
}
