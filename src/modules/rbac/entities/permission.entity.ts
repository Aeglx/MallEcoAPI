import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany } from 'typeorm';
import { Role } from './role.entity';
import { RolePermission } from './role-permission.entity';

@Entity('rbac_permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 1 })
  type: number; // 1-菜单 2-按钮 3-接口 4-数据

  @Column({ nullable: true })
  parentId: number;

  @Column({ default: 0 })
  sortWeight: number;

  @Column({ nullable: true })
  path: string; // 路由路径

  @Column({ nullable: true })
  component: string; // 组件路径

  @Column({ nullable: true })
  icon: string; // 图标

  @Column({ nullable: true })
  method: string; // HTTP方法

  @Column({ nullable: true })
  apiPath: string; // API路径

  @Column({ default: 1 })
  status: number; // 1-正常 2-禁用

  @Column({ default: false })
  isExternal: boolean; // 是否外部链接

  @Column({ nullable: true })
  redirect: string; // 重定向路�?

  @Column({ default: false })
  hidden: boolean; // 是否隐藏

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];

  @OneToMany(() => RolePermission, rolePermission => rolePermission.permission)
  rolePermissions: RolePermission[];

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
