import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../../common/base.entity';

@Entity('mall_user')
@Index(['username'])
@Index(['phone'])
@Index(['email'])
@Index(['isActive'])
export class User extends BaseEntity {
  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 100 })
  password: string;

  @Column({ length: 20, unique: true, nullable: true })
  phone: string;

  @Column({ length: 50, unique: true, nullable: true })
  email: string;

  @Column({ length: 50, nullable: true })
  nickname: string;

  @Column({ length: 255, nullable: true })
  avatar: string;

  @Column({ length: 20, default: 'customer' }) // customer, admin, merchant
  role: string;

  @Column({ name: 'is_active', default: 1 })
  isActive: number;

  @Column({ name: 'last_login_time', type: 'datetime', nullable: true })
  lastLoginTime: Date;
}
