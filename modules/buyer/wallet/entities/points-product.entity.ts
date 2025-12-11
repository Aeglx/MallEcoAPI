import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('points_products')
export class PointsProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, comment: '商品名称' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: '商品描述' })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '商品图片' })
  image: string;

  @Column({ type: 'int', comment: '积分价格' })
  pointsPrice: number;

  @Column({ type: 'int', default: 0, comment: '库存数量' })
  stock: number;

  @Column({ type: 'int', default: 0, comment: '已兑换数量' })
  exchangeCount: number;

  @Column({
    type: 'enum',
    enum: ['physical', 'virtual', 'coupon'],
    default: 'physical',
    comment: '商品类型',
  })
  type: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'sold_out'],
    default: 'active',
    comment: '状态',
  })
  status: string;

  @Column({ type: 'json', nullable: true, comment: '商品属性' })
  attributes: any;

  @Column({ type: 'datetime', nullable: true, comment: '开始时间' })
  startTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '结束时间' })
  endTime: Date;

  @Column({ type: 'int', default: 0, comment: '排序权重' })
  sortOrder: number;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updatedAt: Date;
}