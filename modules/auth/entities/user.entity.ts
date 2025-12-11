import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRoleEntity } from './user-role.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    unique: true, 
    comment: '用户名' 
  })
  username: string;

  @Column({ 
    name: 'email', 
    type: 'varchar', 
    length: 100, 
    unique: true, 
    nullable: true,
    comment: '邮箱' 
  })
  email: string;

  @Column({ 
    name: 'phone', 
    type: 'varchar', 
    length: 20, 
    unique: true, 
    nullable: true,
    comment: '手机号' 
  })
  phone: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    comment: '昵称' 
  })
  nickname: string;

  @Column({ 
    type: 'varchar', 
    length: 500, 
    nullable: true,
    comment: '头像' 
  })
  avatar: string;

  @Column({ 
    type: 'varchar', 
    length: 100, 
    select: false,
    comment: '密码（加密存储）' 
  })
  password: string;

  @Column({ 
    name: 'status',
    type: 'enum',
    enum: ['active', 'inactive', 'banned', 'pending'],
    default: 'active',
    comment: '用户状态' 
  })
  status: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    comment: '最后登录IP' 
  })
  lastLoginIp: string;

  @Column({ 
    name: 'last_login_time', 
    type: 'datetime', 
    nullable: true,
    comment: '最后登录时间' 
  })
  lastLoginAt: Date;

  @Column({ 
    name: 'register_time', 
    type: 'datetime', 
    comment: '注册时间' 
  })
  registerTime: Date;

  @Column({ 
    name: 'register_ip', 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    comment: '注册IP' 
  })
  registerIp: string;

  @Column({ 
    name: 'password_changed_at', 
    type: 'datetime', 
    nullable: true,
    comment: '密码修改时间' 
  })
  passwordChangedAt: Date;

  @Column({ 
    name: 'must_change_password', 
    type: 'boolean', 
    default: false,
    comment: '是否需要强制修改密码' 
  })
  mustChangePassword: boolean;

  @Column({ 
    name: 'email_verified', 
    type: 'boolean', 
    default: false,
    comment: '邮箱是否已验证' 
  })
  emailVerified: boolean;

  @Column({ 
    name: 'phone_verified', 
    type: 'boolean', 
    default: false,
    comment: '手机号是否已验证' 
  })
  phoneVerified: boolean;

  @Column({ 
    name: 'login_count', 
    type: 'int', 
    default: 0,
    comment: '登录次数' 
  })
  loginCount: number;

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
  @OneToMany(() => UserRoleEntity, userRole => userRole.user)
  userRoles: UserRoleEntity[];
}