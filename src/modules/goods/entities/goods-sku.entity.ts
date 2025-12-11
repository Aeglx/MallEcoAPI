import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { GoodsEntity } from './goods.entity';

@Entity('mall_goods_sku')
@Index(['goodsId'])
@Index(['skuSn'])
@Index(['price'])
@Index(['stock'])
@Index(['sales'])
@Index(['status'])
@Index(['createTime'])
export class GoodsSkuEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'SKU ID' })
  id: string;

  @Column({ name: 'goods_id', length: 36, comment: '商品ID' })
  @ApiProperty({ description: '商品ID' })
  goodsId: string;

  @Column({ name: 'sku_sn', length: 50, comment: 'SKU编号' })
  @ApiProperty({ description: 'SKU编号' })
  skuSn: string;

  @Column({ type: 'json', comment: '规格参数(JSON格式)' })
  @ApiProperty({ description: '规格参数' })
  specifications: any;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, comment: '价格' })
  @ApiProperty({ description: '价格' })
  price: number;

  @Column({ name: 'original_price', type: 'decimal', precision: 12, scale: 2, nullable: true, comment: '原价' })
  @ApiProperty({ description: '原价' })
  originalPrice: number;

  @Column({ name: 'cost_price', type: 'decimal', precision: 12, scale: 2, nullable: true, comment: '成本价' })
  @ApiProperty({ description: '成本价' })
  costPrice: number;

  @Column({ default: 0, comment: '库存数量' })
  @ApiProperty({ description: '库存数量' })
  stock: number;

  @Column({ name: 'warning_stock', default: 10, comment: '库存预警值' })
  @ApiProperty({ description: '库存预警值' })
  warningStock: number;

  @Column({ default: 0, comment: '销量' })
  @ApiProperty({ description: '销量' })
  sales: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true, comment: '重量(kg)' })
  @ApiProperty({ description: '重量(kg)' })
  weight: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true, comment: '体积(m³)' })
  @ApiProperty({ description: '体积(m³)' })
  volume: number;

  @Column({ length: 50, nullable: true, comment: '条形码' })
  @ApiProperty({ description: '条形码' })
  barcode: string;

  @Column({ length: 500, nullable: true, comment: 'SKU图片' })
  @ApiProperty({ description: 'SKU图片' })
  image: string;

  @Column({ name: 'is_default', default: 0, comment: '是否默认SKU' })
  @ApiProperty({ description: '是否默认SKU' })
  isDefault: number;

  @Column({ default: 1, comment: '状态: 1-正常 0-禁用' })
  @ApiProperty({ description: '状态' })
  status: number;

  @CreateDateColumn({ name: 'create_time', type: 'datetime', comment: '创建时间' })
  @ApiProperty({ description: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', type: 'datetime', comment: '更新时间' })
  @ApiProperty({ description: '更新时间' })
  updateTime: Date;

  @Column({ name: 'create_by', length: 36, nullable: true, comment: '创建人' })
  @ApiProperty({ description: '创建人' })
  createBy: string;

  @Column({ name: 'update_by', length: 36, nullable: true, comment: '更新人' })
  @ApiProperty({ description: '更新人' })
  updateBy: string;

  @Column({ name: 'is_del', default: 0, comment: '删除标志' })
  @ApiProperty({ description: '删除标志' })
  isDel: number;

  // 关联关系
  @ManyToOne(() => GoodsEntity, goods => goods.skus)
  @JoinColumn({ name: 'goods_id' })
  goods: GoodsEntity;
}