import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, Index } from 'typeorm';
import { Member } from './member.entity';

@Entity('member_addresses')
export class MemberAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ comment: '会员ID' })
  memberId: string;

  @Column({ length: 100, comment: '收货人姓名' })
  name: string;

  @Column({ length: 20, comment: '收货人电话' })
  phone: string;

  @Column({ length: 100, comment: '省份' })
  province: string;

  @Column({ length: 100, comment: '城市' })
  city: string;

  @Column({ length: 100, comment: '区县' })
  district: string;

  @Column({ length: 200, comment: '详细地址' })
  address: string;

  @Column({ length: 20, nullable: true, comment: '邮政编码' })
  postalCode: string;

  @Column({ type: 'boolean', default: false, comment: '是否默认地址' })
  isDefault: boolean;

  @Column({ type: 'point', nullable: true, spatialFeatureType: 'Point', srid: 4326, comment: '地理位置' })
  location: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ comment: '删除时间' })
  deletedAt: Date;

  // 关联会员
  @ManyToOne(() => Member, member => member.addresses)
  @Index()
  member: Member;
}
