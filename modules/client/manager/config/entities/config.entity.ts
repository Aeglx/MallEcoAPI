import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('system_config')
export class Config {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '配置键' })
  key: string;

  @Column({ type: 'text', nullable: true, comment: '配置值' })
  value: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '配置描述' })
  description: string;

  @Column({ type: 'varchar', length: 20, default: 'string', comment: '配置类型' })
  type: string;

  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  enabled: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '配置组' })
  group: string;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date;
}
