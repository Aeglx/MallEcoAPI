import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('goods')
export class Goods {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  goodsName: string;

  @Column({ type: 'text', nullable: true })
  goodsDescription: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  marketPrice: number;

  @Column('int')
  stock: number;

  @Column({ length: 100 })
  categoryId: string;

  @Column({ length: 100, nullable: true })
  brandId: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ default: true })
  isOnSale: boolean;

  @Column({ default: false })
  isRecommend: boolean;

  @Column({ default: false })
  isHot: boolean;

  @Column('int', { default: 0 })
  salesCount: number;

  @Column('int', { default: 0 })
  viewCount: number;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @Column({ default: false })
  deleted: boolean;
}