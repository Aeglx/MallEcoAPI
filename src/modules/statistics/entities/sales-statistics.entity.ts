import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('sales_statistics')
@Index(['statDate', 'productId'])
@Index(['statDate', 'categoryId'])
export class SalesStatistics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', comment: '统计日期' })
  statDate: string;

  @Column({ type: 'int', nullable: true, comment: '商品ID' })
  productId: number;

  @Column({ type: 'int', nullable: true, comment: '分类ID' })
  categoryId: number;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '商品名称' })
  productName: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '分类名称' })
  categoryName: string;

  @Column({ type: 'int', default: 0, comment: '销售数量' })
  salesQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '销售金额' })
  salesAmount: number;

  @Column({ type: 'int', default: 0, comment: '浏览人数' })
  viewCount: number;

  @Column({ type: 'int', default: 0, comment: '购买人数' })
  buyerCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, comment: '转化率' })
  conversionRate: number;

  @Column({ type: 'varchar', length: 50, default: 'daily', comment: '统计粒度: daily, weekly, monthly' })
  granularity: string;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date;
}