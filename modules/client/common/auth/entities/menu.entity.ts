import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Tree, TreeChildren, TreeParent } from 'typeorm';

@Entity('auth_menu')
@Tree('closure-table')
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string; // 菜单标题，对应Java版的title

  @Column({ length: 100, nullable: true })
  name: string; // 路由名称，对应Java版的name

  @Column({ length: 200, nullable: true })
  path: string; // 路径，对应Java版的path

  @Column({ default: 1 })
  level: number; // 菜单层级，对应Java版的level

  @Column({ length: 200, nullable: true })
  frontRoute: string; // 前端目录文件，对应Java版的frontRoute

  @Column({ nullable: true })
  parentId: string; // 父id，对应Java版的parentId

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  sortOrder: number; // 排序值，对应Java版的sortOrder

  @Column({ type: 'text', nullable: true })
  permission: string; // 权限URL，对应Java版的permission

  @Column({ length: 100, nullable: true })
  icon: string; // 图标，对应Java版的icon

  @Column({ type: 'text', nullable: true })
  description: string; // 描述，对应Java版的description

  @Column({ default: 0 })
  type: number; // 0-目录 1-菜单 2-按钮

  @Column({ default: 1 })
  status: number; // 0-禁用 1-启用

  @Column({ default: false })
  hidden: boolean;

  @Column({ length: 100, nullable: true })
  redirect: string;

  @Column({ default: false })
  deleteFlag: boolean; // 删除标志，对应Java版的deleteFlag

  @Column({ default: 1, comment: '终端类型: 1-管理端 2-卖家端' })
  appType: number;

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