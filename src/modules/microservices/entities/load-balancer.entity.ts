import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('microservices_load_balancer')
export class LoadBalancerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  serviceName: string;

  @Column({ length: 50 })
  strategy: string;

  @Column({
    type: 'enum',
    enum: ['round-robin', 'weighted-round-robin', 'least-connections', 'ip-hash', 'random'],
    default: 'round-robin',
  })
  algorithm: string;

  @Column({ type: 'json', nullable: true })
  instanceWeights: Record<string, number>;

  @Column({ default: 3 })
  healthCheckThreshold: number;

  @Column({ default: 30 })
  healthCheckInterval: number;

  @Column({ default: 5 })
  timeout: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  configuration: Record<string, any>;

  @Column({ default: 0 })
  failedRequests: number;

  @Column({ default: 0 })
  totalRequests: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  failureRate: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
