import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  ManyToOne,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { RoleEntity } from './role.entity';

@Entity('user_roles')
export class UserRoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', comment: '用户ID' })
  userId: string;

  @Column({ name: 'role_id', comment: '角色ID' })
  roleId: string;

  @Column({ 
    name: 'assigned_by', 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    comment: '分配人' 
  })
  assignedBy: string;

  @Column({ 
    name: 'assigned_time', 
    type: 'datetime', 
    comment: '分配时间' 
  })
  assignedTime: Date;

  @Column({ 
    name: 'expire_time', 
    type: 'datetime', 
    nullable: true,
    comment: '过期时间' 
  })
  expireTime: Date;

  @CreateDateColumn({ 
    name: 'created_at', 
    type: 'datetime', 
    comment: '创建时间' 
  })
  createdAt: Date;

  // 关联关系
  @ManyToOne(() => UserEntity, user => user.userRoles)
  user: UserEntity;

  @ManyToOne(() => RoleEntity, role => role.userRoles)
  role: RoleEntity;
}