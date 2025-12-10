import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('service_mesh_traffic')
export class MeshTrafficEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  serviceName: string;

  @Column({ length: 100, nullable: true })
  sourceService: string;

  @Column({ length: 100, nullable: true })
  destinationService: string;

  @Column({ length: 50 })
  meshType: string;

  @Column({ type: 'enum', enum: ['request', 'response', 'connection'], default: 'request' })
  trafficType: string;

  @Column({ length: 20, nullable: true })
  method: string;

  @Column({ length: 500, nullable: true })
  path: string;

  @Column({ type: 'int', default: 200 })
  statusCode: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  responseTime: number;

  @Column({ type: 'int', default: 0 })
  requestSize: number;

  @Column({ type: 'int', default: 0 })
  responseSize: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  cpuUsage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  memoryUsage: number;

  @Column({ type: 'int', default: 0 })
  activeConnections: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  throughput: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  errorRate: number;

  @Column({ type: 'jsonb', nullable: true })
  headers: Record<string, string>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column()
  timestamp: Date;

  @Column({ length: 50 })
  interval: string;

  @CreateDateColumn()
  createdAt: Date;
}