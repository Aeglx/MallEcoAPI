import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('rbac_menus')
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  path: string;

  @Column({ nullable: true })
  component: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  parentId: number;

  @ManyToOne(() => Menu, menu => menu.children)
  @JoinColumn({ name: 'parentId' })
  parent: Menu;

  @OneToMany(() => Menu, menu => menu.parent)
  children: Menu[];

  @Column({ default: 0 })
  sortWeight: number;

  @Column({ default: 1 })
  status: number; // 1-正常 2-禁用

  @Column({ default: false })
  hidden: boolean;

  @Column({ nullable: true })
  redirect: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  affix: boolean;

  @Column({ nullable: true })
  cache: boolean;

  @Column({ nullable: true })
  breadcrumb: boolean;

  @Column({ nullable: true })
  activeMenu: string;

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
