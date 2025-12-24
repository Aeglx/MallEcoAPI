import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, nullable: true })
  parentId: string;

  @Column('int', { default: 0 })
  level: number;

  @Column('int', { default: 0 })
  sortOrder: number;

  @Column({ length: 200, nullable: true })
  image: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  status: boolean;

  @Column('simple-array', { nullable: true })
  keywords: string[];

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @Column({ default: false })
  deleted: boolean;
}