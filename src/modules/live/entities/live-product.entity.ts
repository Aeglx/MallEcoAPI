import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('live_products')
@Index(['roomId'])
@Index(['productId'])
export class LiveProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  roomId: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'int', default: 0 })
  displayOrder: number; // 展示顺序

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  livePrice: number; // 直播价

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  flashSalePrice: number; // 秒杀价

  @Column({ type: 'int', nullable: true })
  flashSaleStock: number; // 秒杀库存

  @Column({ type: 'int', default: 0 })
  viewCount: number; // 商品查看次数

  @Column({ type: 'int', default: 0 })
  clickCount: number; // 商品点击次数

  @Column({ type: 'int', default: 0 })
  orderCount: number; // 下单次数

  @Column({ type: 'int', default: 0 })
  saleCount: number; // 销售数量

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  saleAmount: number; // 销售金额

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  addedTime: Date; // 添加到直播间的时间

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // 扩展信息

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleteTime: Date;
}