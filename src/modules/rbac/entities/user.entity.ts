import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.entity';
import { Department } from './department.entity';

@Entity('rbac_users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  realName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 1 })
  status: number; // 1-正常 2-禁用 3-锁定

  @Column({ default: 0 })
  gender: number; // 0-未知 1-�?2-�?

  @Column({ nullable: true })
  lastLoginIp: string;

  @Column({ nullable: true })
  lastLoginTime: Date;

  @Column({ default: 0 })
  loginCount: number;

  @Column({ nullable: true })
  departmentId: number;

  @ManyToOne(() => Department, department => department.users)
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @ManyToMany(() => Role, role => role.users)
  @JoinTable({
    name: 'rbac_user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[];

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
