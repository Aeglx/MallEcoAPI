import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('group_buyings')
export class GroupBuyingEntity {
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

  @Column({ name: 'group_price', type: 'decimal', precision: 10, scale: 2, comment: '拼团价' })
  groupPrice: number;

  @Column({ name: 'original_price', type: 'decimal', precision: 10, scale: 2, comment: '原价' })
  originalPrice: number;

  @Column({ name: 'min_people', type: 'int', comment: '成团人数' })
  minPeople: number;

  @Column({ name: 'max_people', type: 'int', comment: '最大人数' })
  maxPeople: number;

  @Column({ type: 'int', default: 0, comment: '当前人数' })
  currentPeople: number;

  @Column({ name: 'start_time', type: 'datetime', comment: '开始时间' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime', comment: '结束时间' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: ['recruiting', 'in_progress', 'success', 'failed', 'cancelled'],
    default: 'recruiting',
    comment: '拼团状态',
  })
  status: string;

  @Column({ name: 'success_time', type: 'datetime', nullable: true, comment: '成团时间' })
  successTime: Date;

  @Column({ type: 'json', nullable: true, comment: '拼团规则' })
  rules: any;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updatedAt: Date;
}