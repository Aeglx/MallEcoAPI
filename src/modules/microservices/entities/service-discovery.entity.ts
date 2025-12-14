import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('microservices_service_discovery')
export class ServiceDiscoveryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  serviceName: string;

  @Column({ length: 200 })
  discoveryUrl: string;

  @Column({ type: 'enum', enum: ['consul', 'eureka', 'zookeeper', 'etcd', 'k8s'], default: 'consul' })
  discoveryType: string;

  @Column({ type: 'json', nullable: true })
  configuration: Record<string, any>;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'error'], default: 'active' })
  status: string;

  @Column({ nullable: true })
  lastSyncTime: Date;

  @Column({ default: 0 })
  syncInterval: number;

  @Column({ default: true })
  autoDiscovery: boolean;

  @Column({ length: 500, nullable: true })
  healthCheckUrl: string;

  @Column({ type: 'json', nullable: true })
  serviceFilters: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
