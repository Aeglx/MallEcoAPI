import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('service_mesh_gateway')
export class MeshGatewayEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  gatewayName: string;

  @Column({ length: 50 })
  gatewayType: string;

  @Column({ type: 'enum', enum: ['ingress', 'egress', 'east-west'], default: 'ingress' })
  direction: string;

  @Column({ length: 200 })
  host: string;

  @Column({ default: 80 })
  port: number;

  @Column({ length: 50, nullable: true })
  protocol: string;

  @Column({ type: 'jsonb' })
  routes: Array<{
    path: string;
    destination: string;
    methods: string[];
    timeout: number;
    retries: number;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  tlsConfig: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  rateLimitConfig: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  corsConfig: Record<string, any>;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'error'], default: 'active' })
  status: string;

  @Column({ default: true })
  isEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  customFilters: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}