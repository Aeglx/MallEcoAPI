import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('microservices_service_config')
export class ServiceConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  serviceName: string;

  @Column({ length: 100 })
  configKey: string;

  @Column({ type: 'text' })
  configValue: string;

  @Column({ type: 'enum', enum: ['string', 'number', 'boolean', 'json', 'array'], default: 'string' })
  valueType: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ default: true })
  isRequired: boolean;

  @Column({ nullable: true })
  defaultValue: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  validationRules: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
