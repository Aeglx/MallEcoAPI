import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('flash_sales')
export class FlashSaleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, comment: '活动名称' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: '活动描述' })
  description: string;

  @Column({ name: 'product_id', comment: '商品ID' })
  productId: string;

  @Column({ name: 'product_name', type: 'varchar', length: 200, comment: '商品名称' })
  productName: string;

  @Column({ name: 'original_price', type: 'decimal', precision: 10, scale: 2, comment: '原价' })
  originalPrice: number;

  @Column({ name: 'sale_price', type: 'decimal', precision: 10, scale: 2, comment: '秒杀价' })
  salePrice: number;

  @Column({ type: 'int', comment: '秒杀库存' })
  stock: number;

  @Column({ type: 'int', default: 0, comment: '已售数量' })
  soldCount: number;

  @Column({ name: 'start_time', type: 'datetime', comment: '开始时间' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime', comment: '结束时间' })
  endTime: Date;

  @Column({ name: 'limit_per_user', type: 'int', default: 1, comment: '每人限购' })
  limitPerUser: number;

  @Column({
    type: 'enum',
    enum: ['waiting', 'active', 'ended', 'cancelled'],
    default: 'waiting',
    comment: '活动状态',
  })
  status: string;

  @Column({ type: 'json', nullable: true, comment: '活动规则' })
  rules: any;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updatedAt: Date;
}