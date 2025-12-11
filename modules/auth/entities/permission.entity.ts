import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RolePermissionEntity } from './role-permission.entity';

@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    unique: true, 
    comment: '权限名称' 
  })
  name: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    nullable: true,
    comment: '权限描述' 
  })
  description: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    comment: '权限标识' 
  })
  code: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    comment: '权限类型' 
  })
  type: string;

  @Column({ 
    name: 'resource', 
    type: 'varchar', 
    length: 100, 
    comment: '资源标识' 
  })
  resource: string;

  @Column({ 
    name: 'action', 
    type: 'varchar', 
    length: 50, 
    comment: '操作类型' 
  })
  action: string;

  @Column({ 
    name: 'parent_id', 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    comment: '父权限ID' 
  })
  parentId: string;

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
    name: 'is_system', 
    type: 'boolean', 
    default: false,
    comment: '是否系统内置权限' 
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
  @OneToMany(() => RolePermissionEntity, rolePermission => rolePermission.permission)
  rolePermissions: RolePermissionEntity[];
}