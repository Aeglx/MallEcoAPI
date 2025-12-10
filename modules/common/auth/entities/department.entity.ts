import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Tree, TreeChildren, TreeParent, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('auth_department')
@Tree('closure-table')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 100, nullable: true })
  description: string;

  @Column({ length: 20, nullable: true })
  code: string;

  @Column({ default: 1 })
  status: number; // 0-禁用 1-启用

  @Column({ default: 0 })
  sort: number;

  @Column({ nullable: true })
  leaderId: string;

  @Column({ length: 50, nullable: true })
  leaderName: string;

  @Column({ length: 20, nullable: true })
  leaderMobile: string;

  @Column({ nullable: true })
  parentId: string;

  @TreeChildren()
  children: Department[];

  @TreeParent()
  parent: Department;

  @OneToMany(() => User, user => user.department)
  users: User[];

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @Column({ nullable: true })
  createBy: string;

  @Column({ nullable: true })
  updateBy: string;
}