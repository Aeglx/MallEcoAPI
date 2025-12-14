import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('service_mesh_config')
export class MeshConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  meshName: string;

  @Column({ length: 50 })
  version: string;

  @Column({ type: 'enum', enum: ['istio', 'linkerd', 'consul', 'kuma'], default: 'istio' })
  meshType: string;

  @Column({ type: 'jsonb' })
  configuration: Record<string, any>;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'updating'], default: 'inactive' })
  status: string;

  @Column({ default: true })
  autoInject: boolean;

  @Column({ default: true })
  mtlsEnabled: boolean;

  @Column({ default: true })
  telemetryEnabled: boolean;

  @Column({ length: 500, nullable: true })
  controlPlaneUrl: string;

  @Column({ length: 500, nullable: true })
  dataPlaneUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  namespaceConfig: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  workloadConfig: Record<string, any>;

  @Column({ nullable: true })
  lastDeployTime: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
