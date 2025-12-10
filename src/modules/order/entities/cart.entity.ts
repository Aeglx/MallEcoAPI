import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('shopping_cart')
export class CartEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  memberId: string;

  @Column({ length: 100 })
  goodsId: string;

  @Column({ length: 100 })
  goodsName: string;

  @Column({ length: 100 })
  goodsImage: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  goodsPrice: number;

  @Column({ type: 'int', default: 1 })
  goodsNum: number;

  @Column({ length: 50, nullable: true })
  categoryId: string;

  @Column({ length: 100, nullable: true })
  categoryName: string;

  @Column({ type: 'text', nullable: true })
  goodsSpec: string;

  @Column({ length: 100, nullable: true })
  skuId: string;

  @Column({ type: 'text', nullable: true })
  skuName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  skuPrice: number;

  @Column({ type: 'int', nullable: true })
  skuStock: number;

  @Column({ length: 200, nullable: true })
  skuImage: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ type: 'enum', enum: ['ACTIVE', 'INVALID', 'DELETED'], default: 'ACTIVE' })
  status: string;

  @Column({ length: 50, nullable: true })
  storeId: string;

  @Column({ length: 200, nullable: true })
  storeName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  freightPrice: number;

  @Column({ type: 'jsonb', nullable: true })
  extension: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ nullable: true })
  selectedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}