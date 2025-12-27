import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('store')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  storeName: string;

  @Column({ length: 200, nullable: true })
  storeLogo: string;

  @Column({ type: 'text', nullable: true })
  storeDescription: string;

  @Column({ length: 100 })
  ownerId: string;

  @Column({ length: 20 })
  contactPhone: string;

  @Column({ length: 100, nullable: true })
  contactEmail: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ length: 20, nullable: true })
  businessLicense: string;

  @Column({ length: 100, nullable: true })
  businessLicenseImage: string;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  storeScore: number;

  @Column('int', { default: 0 })
  salesCount: number;

  @Column('int', { default: 0 })
  goodsCount: number;

  @Column({ default: 'PENDING' })
  auditStatus: string; // PENDING, APPROVED, REJECTED

  @Column({ type: 'text', nullable: true })
  auditRemark: string;

  @Column({ type: 'timestamp', nullable: true })
  auditTime: Date;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @Column({ default: false })
  deleted: boolean;
}
