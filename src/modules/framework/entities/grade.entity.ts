import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('member_grade')
export class MemberGrade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  gradeName: string;

  @Column('int')
  requiredPoints: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('int', { default: 0 })
  sortOrder: number;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @Column({ default: false })
  deleted: boolean;
}