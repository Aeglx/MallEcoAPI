import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('system_config')
export class SystemConfigEntity {
  @ApiProperty({ description: '配置ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '配置键名' })
  @Column({ length: 100, unique: true })
  configKey: string;

  @ApiProperty({ description: '配置值' })
  @Column({ type: 'text' })
  configValue: string;

  @ApiProperty({ description: '配置描述' })
  @Column({ length: 200, nullable: true })
  description: string;

  @ApiProperty({ description: '配置类型' })
  @Column({ length: 50, default: 'string' })
  configType: string;

  @ApiProperty({ description: '是否可修改' })
  @Column({ default: true })
  editable: boolean;

  @ApiProperty({ description: '配置分组' })
  @Column({ length: 50, default: 'default' })
  configGroup: string;

  @ApiProperty({ description: '排序值' })
  @Column({ default: 0 })
  sortOrder: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: '创建人' })
  @Column({ length: 50, nullable: true })
  createdBy: string;

  @ApiProperty({ description: '更新人' })
  @Column({ length: 50, nullable: true })
  updatedBy: string;

  @ApiProperty({ description: '是否活跃' })
  @Column({ default: true })
  active: boolean;
}
