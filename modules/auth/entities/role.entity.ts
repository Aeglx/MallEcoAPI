import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRoleEntity } from './user-role.entity';
import { RolePermissionEntity } from './role-permission.entity';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    unique: true, 
    comment: '角色名称' 
  })
  name: string;

  @Column({ 
    type: 'varchar', 
    length: 200, 
    nullable: true,
    comment: '角色描述' 
  })
  description: string;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: 'user',
    comment: '角色代码' 
  })
  code: string;

  @Column({ 
    type: 'int', 
    default: 0,
    comment: '排序权重' 
  })
  sortOrder: number;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
    comment: '状态',
  })
  status: string;

  @Column({ 
    name: 'parent_id', 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    comment: '父角色ID' 
  })
  parentId: string;

  @Column({ 
    name: 'is_system', 
    type: 'boolean', 
    default: false,
    comment: '是否系统内置角色' 
  })
  isSystem: boolean;

  @CreateDateColumn({ 
    name: 'created_at', 
    type: 'datetime', 
    comment: '创建时间' 
  })
  createdAt: Date;

  @UpdateDateColumn({ 
    name: 'updated_at', 
    type: 'datetime', 
    comment: '更新时间' 
  })
  updatedAt: Date;

  // 关联关系
  @OneToMany(() => UserRoleEntity, userRole => userRole.role)
  userRoles: UserRoleEntity[];

  @OneToMany(() => RolePermissionEntity, rolePermission => rolePermission.role)
  rolePermissions: RolePermissionEntity[];
}