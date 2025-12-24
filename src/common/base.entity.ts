import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ name: 'create_time', type: 'datetime' })
  createTime!: Date;

  @UpdateDateColumn({ name: 'update_time', type: 'datetime' })
  updateTime!: Date;

  @Column({ name: 'is_del', default: 0 })
  isDel!: number;
}