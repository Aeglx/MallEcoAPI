import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { StoreLog } from './store-log.entity';
import { Product } from '../../product/entities/product.entity';

export enum StoreStatus {
  DRAFT = 0, // 草稿
  AUDITING = 1, // 审核中
  AUDIT_PASSED = 2, // 审核通过
  AUDIT_FAILED = 3, // 审核失败
  ON_SALE = 4, // 营业中
  OFF_SALE = 5, // 已关店
  FROZEN = 6, // 已冻结
}

export enum StoreType {
  INDIVIDUAL = 'INDIVIDUAL', // 个人店铺
  ENTERPRISE = 'ENTERPRISE', // 企业店铺
  BRAND = 'BRAND', // 品牌店铺
}

export enum StoreLevel {
  LEVEL_1 = 1, // 1级店铺
  LEVEL_2 = 2, // 2级店铺
  LEVEL_3 = 3, // 3级店铺
  LEVEL_4 = 4, // 4级店铺
  LEVEL_5 = 5, // 5级店铺
}

@Entity('mall_store')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_name', type: 'varchar', length: 50, unique: true, comment: '店铺名称' })
  storeName: string;

  @Column({ name: 'store_type', type: 'enum', enum: StoreType, comment: '店铺类型' })
  storeType: StoreType;

  @Column({ name: 'store_level', type: 'int', default: StoreLevel.LEVEL_1, comment: '店铺等级' })
  storeLevel: StoreLevel;

  @Column({ name: 'store_status', type: 'int', default: StoreStatus.DRAFT, comment: '店铺状态' })
  storeStatus: StoreStatus;

  @Column({ name: 'store_logo', type: 'varchar', length: 200, nullable: true, comment: '店铺Logo' })
  storeLogo: string;

  @Column({ name: 'store_banner', type: 'varchar', length: 500, nullable: true, comment: '店铺横幅' })
  storeBanner: string;

  @Column({ name: 'store_description', type: 'text', nullable: true, comment: '店铺描述' })
  storeDescription: string;

  @Column({ name: 'business_license', type: 'varchar', length: 200, nullable: true, comment: '营业执照' })
  businessLicense: string;

  @Column({ name: 'legal_person', type: 'varchar', length: 20, nullable: true, comment: '法人' })
  legalPerson: string;

  @Column({ name: 'contact_person', type: 'varchar', length: 20, comment: '联系人' })
  contactPerson: string;

  @Column({ name: 'contact_phone', type: 'varchar', length: 15, comment: '联系电话' })
  contactPhone: string;

  @Column({ name: 'contact_email', type: 'varchar', length: 50, nullable: true, comment: '联系邮箱' })
  contactEmail: string;

  @Column({ name: 'address', type: 'varchar', length: 200, nullable: true, comment: '店铺地址' })
  address: string;

  @Column({ name: 'province', type: 'varchar', length: 20, nullable: true, comment: '省份' })
  province: string;

  @Column({ name: 'city', type: 'varchar', length: 20, nullable: true, comment: '城市' })
  city: string;

  @Column({ name: 'district', type: 'varchar', length: 20, nullable: true, comment: '区县' })
  district: string;

  @Column({ name: 'zip_code', type: 'varchar', length: 10, nullable: true, comment: '邮政编码' })
  zipCode: string;

  @Column({ name: 'opening_hours', type: 'varchar', length: 50, nullable: true, comment: '营业时间' })
  openingHours: string;

  @Column({ name: 'service_phone', type: 'varchar', length: 15, nullable: true, comment: '客服电话' })
  servicePhone: string;

  @Column({ name: 'service_qq', type: 'varchar', length: 20, nullable: true, comment: '客服QQ' })
  serviceQq: string;

  @Column({ name: 'service_wechat', type: 'varchar', length: 20, nullable: true, comment: '客服微信' })
  serviceWechat: string;

  @Column({ name: 'sales_amount', type: 'decimal', precision: 15, scale: 2, default: 0, comment: '销售额' })
  salesAmount: number;

  @Column({ name: 'sales_count', type: 'int', default: 0, comment: '销售数量' })
  salesCount: number;

  @Column({ name: 'product_count', type: 'int', default: 0, comment: '商品数量' })
  productCount: number;

  @Column({ name: 'follower_count', type: 'int', default: 0, comment: '关注人数' })
  followerCount: number;

  @Column({ name: 'credit_score', type: 'decimal', precision: 3, scale: 1, default: 5.0, comment: '信用评分' })
  creditScore: number;

  @Column({ name: 'audit_remark', type: 'text', nullable: true, comment: '审核备注' })
  auditRemark: string;

  @Column({ name: 'expire_time', type: 'datetime', nullable: true, comment: '到期时间' })
  expireTime: Date;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  @OneToMany(() => StoreLog, (storeLog) => storeLog.store)
  storeLogs: StoreLog[];

  @OneToMany(() => Product, (product) => product.store)
  products: Product[];
}
