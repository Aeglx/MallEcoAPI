import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('system_versions')
export class SystemVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  version: string;

  @Column({ length: 20 })
  type: string; // major, minor, patch, hotfix

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json' })
  features: any[]; // 新功能列�?

  @Column({ type: 'json' })
  fixes: any[]; // 修复的问题列�?

  @Column({ type: 'json' })
  improvements: any[]; // 改进列表

  @Column({ default: false })
  isLts: boolean; // 是否为LTS版本

  @Column({ default: false })
  isCurrent: boolean; // 是否为当前版�?

  @Column({ default: false })
  isDeprecated: boolean; // 是否已废�?

  @Column({ type: 'date', nullable: true })
  releaseDate: Date; // 发布日期

  @Column({ type: 'date', nullable: true })
  endDate: Date; // 停止支持日期

  @Column({ type: 'json', nullable: true })
  dependencies: any; // 版本依赖

  @Column({ default: 0 })
  downloadCount: number; // 下载次数

  @Column({ type: 'text', nullable: true })
  changelog: string; // 更新日志

  @Column({ type: 'json', nullable: true })
  upgradeNotes: any; // 升级说明

  @Column({ default: 'stable' })
  status: string; // stable, beta, alpha, dev

  @Column({ type: 'json', nullable: true })
  compatibility: any; // 兼容性信�?

  @Column({ length: 100, nullable: true })
  downloadUrl: string; // 下载地址

  @Column({ length: 255, nullable: true })
  checksum: string; // 文件校验�?

  @Column({ type: 'bigint', default: 0 })
  fileSize: number; // 文件大小

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
