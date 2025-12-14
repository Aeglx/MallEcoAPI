import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('microservices_circuit_breaker')
export class CircuitBreakerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  serviceName: string;

  @Column({ length: 100 })
  endpoint: string;

  @Column({ type: 'enum', enum: ['closed', 'open', 'half-open'], default: 'closed' })
  state: string;

  @Column({ default: 5 })
  failureThreshold: number;

  @Column({ default: 60 })
  timeout: number;

  @Column({ default: 3 })
  successThreshold: number;

  @Column({ default: 0 })
  failureCount: number;

  @Column({ default: 0 })
  successCount: number;

  @Column({ default: 0 })
  requestCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 50.0 })
  failurePercentage: number;

  @Column({ nullable: true })
  lastFailureTime: Date;

  @Column({ nullable: true })
  lastStateChangeTime: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  configuration: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
