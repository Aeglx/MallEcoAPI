import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('microservices_service_registry')
export class ServiceRegistryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  serviceName: string;

  @Column({ length: 50 })
  version: string;

  @Column({ length: 200 })
  host: string;

  @Column()
  port: number;

  @Column({ default: 'http' })
  protocol: string;

  @Column({ length: 500, nullable: true })
  healthCheckPath: string;

  @Column({ type: 'enum', enum: ['healthy', 'unhealthy', 'unknown'], default: 'unknown' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'maintenance'], default: 'active' })
  state: string;

  @Column({ nullable: true })
  lastHealthCheck: Date;

  @Column({ nullable: true })
  registrationTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}