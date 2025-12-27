import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('member')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 100 })
  password: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  mobile: string;

  @Column({ length: 50, nullable: true })
  nickname: string;

  @Column({ length: 200, nullable: true })
  avatar: string;

  @Column({ default: 0 })
  gender: number; // 0: 未知, 1: 男, 2: 女

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ default: 0 })
  points: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ length: 100, nullable: true })
  gradeId: string;

  @Column({ default: true })
  status: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  lastLoginTime: Date;

  @Column({ length: 50, nullable: true })
  lastLoginIp: string;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @Column({ default: false })
  deleted: boolean;
}
