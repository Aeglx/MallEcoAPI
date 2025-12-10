import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('service_mesh_telemetry')
export class MeshTelemetryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  serviceName: string;

  @Column({ length: 100, nullable: true })
  sourceService: string;

  @Column({ length: 100, nullable: true })
  destinationService: string;

  @Column({ length: 50 })
  traceId: string;

  @Column({ length: 50 })
  spanId: string;

  @Column({ type: 'enum', enum: ['request', 'response', 'error'], default: 'request' })
  eventType: string;

  @Column({ type: 'enum', enum: ['http', 'tcp', 'grpc', 'mqtt'], default: 'http' })
  protocol: string;

  @Column({ length: 20, nullable: true })
  method: string;

  @Column({ length: 500, nullable: true })
  path: string;

  @Column({ type: 'int', default: 200 })
  statusCode: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  duration: number;

  @Column({ type: 'int', default: 0 })
  requestSize: number;

  @Column({ type: 'int', default: 0 })
  responseSize: number;

  @Column({ type: 'jsonb', nullable: true })
  headers: Record<string, string>;

  @Column({ type: 'jsonb', nullable: true })
  tags: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  baggage: Record<string, string>;

  @Column()
  timestamp: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  stackTrace: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}