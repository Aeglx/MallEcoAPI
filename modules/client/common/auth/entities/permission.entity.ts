import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Tree, TreeChildren, TreeParent } from 'typeorm';

@Entity('auth_permission')
@Tree('closure-table')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 100, nullable: true })
  description: string;

  @Column({ length: 100 })
  code: string; // 权限标识，如：user:create

  @Column({ default: 1 })
  type: number; // 1-菜单权限 2-按钮权限 3-接口权限

  @Column({ nullable: true })
  resource: string; // 资源路径

  @Column({ nullable: true })
  action: string; // 操作类型

  @Column({ default: 1 })
  status: number; // 0-禁用 1-启用

  @Column({ default: 0 })
  sort: number;

  @TreeChildren()
  children: Permission[];

  @TreeParent()
  parent: Permission;

  @Column({ nullable: true })
  parentId: string;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @Column({ nullable: true })
  createBy: string;

  @Column({ nullable: true })
  updateBy: string;
}