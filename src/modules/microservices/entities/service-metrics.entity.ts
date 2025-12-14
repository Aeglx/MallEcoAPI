import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('microservices_service_metrics')
@Index(['serviceName', 'timestamp'])
export class ServiceMetricsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  serviceName: string;

  @Column({ length: 50 })
  instanceId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  cpuUsage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  memoryUsage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  responseTime: number;

  @Column({ default: 0 })
  requestCount: number;

  @Column({ default: 0 })
  errorCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  errorRate: number;

  @Column({ default: 0 })
  activeConnections: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  throughput: number;

  @Column({ type: 'enum', enum: ['1m', '5m', '15m', '1h'], default: '1m' })
  interval: string;

  @Column()
  timestamp: Date;

  @Column({ type: 'json', nullable: true })
  customMetrics: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}