import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  ManyToOne,
} from 'typeorm';
import { RoleEntity } from './role.entity';
import { PermissionEntity } from './permission.entity';

@Entity('role_permissions')
export class RolePermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'role_id', comment: '角色ID' })
  roleId: string;

  @Column({ name: 'permission_id', comment: '权限ID' })
  permissionId: string;

  @Column({ 
    name: 'granted_by', 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    comment: '授权人' 
  })
  grantedBy: string;

  @Column({ 
    name: 'granted_time', 
    type: 'datetime', 
    comment: '授权时间' 
  })
  grantedTime: Date;

  @Column({ 
    name: 'conditions', 
    type: 'json', 
    nullable: true,
    comment: '权限条件' 
  })
  conditions: any;

  @CreateDateColumn({ 
    name: 'created_at', 
    type: 'datetime', 
    comment: '创建时间' 
  })
  createdAt: Date;

  // 关联关系
  @ManyToOne(() => RoleEntity, role => role.rolePermissions)
  role: RoleEntity;

  @ManyToOne(() => PermissionEntity, permission => permission.rolePermissions)
  permission: PermissionEntity;
}