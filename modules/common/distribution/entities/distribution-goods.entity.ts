import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Distribution } from './distribution.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('distribution_goods')
@Index(['distributionId'])
@Index(['productId'])
@Index(['commissionType'])
export class DistributionGoods {
  @PrimaryGeneratedColumn('bigint')
  id: string;

  @Column({ name: 'distribution_id', type: 'bigint', comment: '分销员ID' })
  distributionId: string;

  @Column({ name: 'product_id', type: 'bigint', comment: '商品ID' })
  productId: string;

  @Column({ name: 'sku_id', type: 'bigint', nullable: true, comment: 'SKU ID' })
  skuId: string;

  @Column({
    type: 'enum',
    enum: ['percentage', 'fixed'],
    default: 'percentage',
    comment: '佣金类型：percentage-百分比，fixed-固定金额'
  })
  commissionType: string;

  @Column({ name: 'first_commission', type: 'decimal', precision: 8, scale: 2, comment: '一级佣金比例或金额' })
  firstCommission: number;

  @Column({ name: 'second_commission', type: 'decimal', precision: 8, scale: 2, comment: '二级佣金比例或金额' })
  secondCommission: number;

  @Column({ name: 'third_commission', type: 'decimal', precision: 8, scale: 2, default: 0, comment: '三级佣金比例或金额' })
  thirdCommission: number;

  @Column({ name: 'min_commission', type: 'decimal', precision: 8, scale: 2, default: 0, comment: '最低佣金金额' })
  minCommission: number;

  @Column({ name: 'max_commission', type: 'decimal', precision: 8, scale: 2, nullable: true, comment: '最高佣金金额' })
  maxCommission: number;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
    comment: '状态：active-启用，inactive-禁用'
  })
  status: string;

  @Column({ name: 'start_time', type: 'datetime', nullable: true, comment: '开始时间' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime', nullable: true, comment: '结束时间' })
  endTime: Date;

  @Column({ name: 'total_sales', type: 'int', default: 0, comment: '总销量' })
  totalSales: number;

  @Column({ name: 'total_commission', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '总佣金' })
  totalCommission: number;

  @Column({ name: 'click_count', type: 'int', default: 0, comment: '点击次数' })
  clickCount: number;

  @Column({ name: 'convert_count', type: 'int', default: 0, comment: '转化次数' })
  convertCount: number;

  @Column({ name: 'convert_rate', type: 'decimal', precision: 5, scale: 2, default: 0, comment: '转化率' })
  convertRate: number;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({ name: 'remark', type: 'text', nullable: true, comment: '备注' })
  remark: string;

  // 关联关系
  @ManyToOne(() => Distribution, distribution => distribution.goods)
  distribution: Distribution;

  @ManyToOne(() => Product, product => product.distributionGoods)
  product: Product;

  @CreateDateColumn({ name: 'create_time', type: 'datetime', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', type: 'datetime', comment: '更新时间' })
  updateTime: Date;
}