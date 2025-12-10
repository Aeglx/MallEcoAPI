import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('system_diagnosis')
export class SystemDiagnosis {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  type: string; // health, performance, security, dependency, connectivity

  @Column({ length: 100 })
  category: string; // database, cache, network, disk, memory, cpu, api

  @Column({ length: 50 })
  status: string; // normal, warning, error, critical

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json', nullable: true })
  details: any; // 诊断详细信息

  @Column({ type: 'json', nullable: true })
  metrics: any; // 相关指标数据

  @Column({ type: 'text', nullable: true })
  suggestion: string; // 建议处理方案

  @Column({ type: 'json', nullable: true })
  actions: any[]; // 推荐操作

  @Column({ type: 'json', nullable: true })
  affected: any; // 影响范围

  @Column({ default: false })
  isResolved: boolean; // 是否已解决

  @Column({ type: 'text', nullable: true })
  resolution: string; // 解决方案

  @Column({ type: 'datetime', nullable: true })
  resolvedAt: Date; // 解决时间

  @Column({ length: 100, nullable: true })
  resolvedBy: string; // 解决人

  @Column({ default: 'low' })
  severity: string; // low, medium, high, critical

  @Column({ default: false })
  isAutoDiagnosis: boolean; // 是否为自动诊断

  @Column({ type: 'json', nullable: true })
  thresholds: any; // 诊断阈值

  @Column({ type: 'json', nullable: true })
  history: any[]; // 历史记录

  @Column({ type: 'json', nullable: true })
  context: any; // 诊断上下文信息

  @Column({ type: 'json', nullable: true })
  relatedIssues: any[]; // 相关问题

  @Column({ default: false })
  requiresAttention: boolean; // 是否需要关注

  @Column({ type: 'datetime', nullable: true })
  nextCheck: Date; // 下次检查时间

  @Column({ type: 'json', nullable: true })
  tags: string[]; // 标签

  @CreateDateColumn()
  createdAt: Date;
}