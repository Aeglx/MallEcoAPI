import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('goods')
export class Goods {
  @ApiProperty({ description: '商品ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '商品名称' })
  @Column({ length: 200 })
  goodsName: string;

  @ApiProperty({ description: '商品描述' })
  @Column({ type: 'text', nullable: true })
  goodsDescription: string;

  @ApiProperty({ description: '商品价格' })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: '市场价格' })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  marketPrice: number;

  @ApiProperty({ description: '商品库存' })
  @Column('int')
  stock: number;

  @ApiProperty({ description: '分类ID' })
  @Column({ length: 100 })
  categoryId: string;

  @ApiProperty({ description: '品牌ID' })
  @Column({ length: 100, nullable: true })
  brandId: string;

  @ApiProperty({ description: '商品图片' })
  @Column('simple-array', { nullable: true })
  images: string[];

  @ApiProperty({ description: '是否上架' })
  @Column({ default: true })
  isOnSale: boolean;

  @ApiProperty({ description: '是否推荐' })
  @Column({ default: false })
  isRecommend: boolean;

  @ApiProperty({ description: '是否热销' })
  @Column({ default: false })
  isHot: boolean;

  @ApiProperty({ description: '销量' })
  @Column('int', { default: 0 })
  salesCount: number;

  @ApiProperty({ description: '浏览量' })
  @Column('int', { default: 0 })
  viewCount: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createTime: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updateTime: Date;

  @ApiProperty({ description: '是否删除' })
  @Column({ default: false })
  deleted: boolean;
}