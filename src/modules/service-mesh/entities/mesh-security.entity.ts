import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('service_mesh_security')
export class MeshSecurityEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  serviceName: string;

  @Column({ length: 100 })
  policyName: string;

  @Column({ type: 'enum', enum: ['allow', 'deny', 'log'], default: 'allow' })
  action: string;

  @Column({ type: 'enum', enum: ['source', 'destination', 'both'], default: 'both' })
  direction: string;

  @Column({ type: 'json' })
  principals: Array<{
    type: string;
    value: string;
    namespace?: string;
  }>;

  @Column({ type: 'json' })
  conditions: Array<{
    type: string;
    key: string;
    operator: string;
    value: any;
  }>;

  @Column({ type: 'json', nullable: true })
  jwtConfig: {
    issuers: string[];
    audiences: string[];
    requiredClaims: Record<string, any>;
  };

  @Column({ type: 'json', nullable: true })
  rbacConfig: {
    roles: string[];
    permissions: string[];
  };

  @Column({ default: true })
  isEnforced: boolean;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'testing'], default: 'active' })
  status: string;

  @Column({ default: 0 })
  hitCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  falsePositiveRate: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}