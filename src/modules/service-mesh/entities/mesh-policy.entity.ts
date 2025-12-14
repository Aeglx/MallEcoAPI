import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('service_mesh_policy')
export class MeshPolicyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  policyName: string;

  @Column({ length: 50 })
  policyType: string;

  @Column({ type: 'enum', enum: ['traffic', 'security', 'reliability', 'observability'], default: 'traffic' })
  category: string;

  @Column({ type: 'json' })
  targetServices: Array<{
    name: string;
    namespace?: string;
    version?: string;
  }>;

  @Column({ type: 'jsonb' })
  rules: Array<{
    name: string;
    condition: Record<string, any>;
    action: Record<string, any>;
    priority: number;
  }>;

  @Column({ type: 'enum', enum: ['enabled', 'disabled', 'testing'], default: 'enabled' })
  status: string;

  @Column({ default: 0 })
  priority: number;

  @Column({ type: 'jsonb', nullable: true })
  conditions: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  actions: Record<string, any>;

  @Column({ nullable: true })
  effectiveTime: Date;

  @Column({ nullable: true })
  expireTime: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
