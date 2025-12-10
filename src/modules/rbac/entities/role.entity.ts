import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Permission } from './permission.entity';
import { RolePermission } from './role-permission.entity';

@Entity('rbac_roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 1 })
  status: number; // 1-正常 2-禁用

  @Column({ default: 0 })
  sortWeight: number;

  @ManyToMany(() => User, user => user.roles)
  users: User[];

  @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
  rolePermissions: RolePermission[];

  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
    name: 'rbac_role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions: Permission[];

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