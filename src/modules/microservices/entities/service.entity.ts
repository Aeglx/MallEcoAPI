import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('microservice')
@Index(['serviceName', 'version'])
export class ServiceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '服务名称' })
  serviceName: string;

  @Column({ type: 'varchar', length: 20, comment: '版本号' })
  version: string;

  @Column({ type: 'varchar', length: 50, comment: '环境' })
  environment: string;

  @Column({ type: 'varchar', length: 100, comment: '服务描述' })
  description: string;

  @Column({ type: 'varchar', length: 50, comment: '编程语言' })
  language: string;

  @Column({ type: 'varchar', length: 100, comment: 'Git仓库地址' })
  repositoryUrl: string;

  @Column({ type: 'int', comment: '端口' })
  port: number;

  @Column({ type: 'varchar', length: 50, comment: '健康检查路径' })
  healthCheckPath: string;

  @Column({ type: 'int', comment: '实例数量' })
  instanceCount: number;

  @Column({ type: 'varchar', length: 20, comment: '服务状态' })
  status: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: 'CPU使用率(%)' })
  cpuUsage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: '内存使用率(%)' })
  memoryUsage: number;

  @Column({ type: 'int', comment: '请求数/分钟' })
  requestRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: '平均响应时间(ms)' })
  avgResponseTime: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: '错误率(%)' })
  errorRate: number;

  @Column({ type: 'json', nullable: true, comment: '服务配置' })
  configuration: any;

  @Column({ type: 'json', nullable: true, comment: '环境变量' })
  environmentVariables: any;

  @Column({ type: 'varchar', length: 50, comment: '负责人' })
  owner: string;

  @Column({ type: 'date', comment: '最后部署时间' })
  lastDeployedAt: Date;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @CreateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}