import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Role } from './role.entity';
import { Department } from './department.entity';

@Entity('auth_user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 100 })
  password: string;

  @Column({ length: 50, nullable: true })
  nickname: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 20, nullable: true })
  mobile: string;

  @Column({ default: 1 })
  status: number; // 0-禁用 1-启用

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  lastLoginTime: Date;

  @Column({ nullable: true })
  lastLoginIp: string;

  @Column({ default: false })
  isSuperAdmin: boolean;

  @Column({ nullable: true })
  roleId: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column({ nullable: true })
  departmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @Column({ nullable: true })
  createBy: string;

  @Column({ nullable: true })
  updateBy: string;
}