import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Tree, TreeChildren, TreeParent } from 'typeorm';

@Entity('auth_menu')
@Tree('closure-table')
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 100, nullable: true })
  path: string;

  @Column({ length: 100, nullable: true })
  component: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: 0 })
  type: number; // 0-目录 1-菜单 2-按钮

  @Column({ default: 1 })
  status: number; // 0-禁用 1-启用

  @Column({ default: 0 })
  sort: number;

  @Column({ default: false })
  isExternal: boolean;

  @Column({ nullable: true })
  permissionCode: string; // 关联权限标识

  @Column({ length: 100, nullable: true })
  redirect: string;

  @Column({ default: false })
  hidden: boolean;

  @Column({ nullable: true })
  parentId: string;

  @TreeChildren()
  children: Menu[];

  @TreeParent()
  parent: Menu;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @Column({ nullable: true })
  createBy: string;

  @Column({ nullable: true })
  updateBy: string;
}