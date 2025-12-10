import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('rbac_departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  parentId: number;

  @ManyToOne(() => Department, department => department.children)
  @JoinColumn({ name: 'parentId' })
  parent: Department;

  @OneToMany(() => Department, department => department.parent)
  children: Department[];

  @OneToMany(() => User, user => user.department)
  users: User[];

  @Column({ default: 0 })
  sortWeight: number;

  @Column({ default: 1 })
  status: number; // 1-正常 2-禁用

  @Column({ nullable: true })
  leaderId: number;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  updatedBy: number;

  @Column({ type: 'text', nullable: true })
  remark: string;
}