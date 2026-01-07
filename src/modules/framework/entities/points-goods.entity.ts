import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 积分商品实体
 */
@Entity('points_goods')
export class PointsGoods {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, comment: '商品名称' })
  goodsName: string;

  @Column({ type: 'text', nullable: true, comment: '商品描述' })
  description: string;

  @Column({ length: 500, nullable: true, comment: '商品主图' })
  mainImage: string;

  @Column({ type: 'json', nullable: true, comment: '商品图片列表' })
  images: string[];

  @Column({ type: 'int', comment: '兑换所需积分' })
  points: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0, comment: '商品原价（人民币）' })
  originalPrice: number;

  @Column({ type: 'int', default: 0, comment: '库存数量' })
  stock: number;

  @Column({ type: 'int', default: 0, comment: '已兑换数量' })
  sales: number;

  @Column({ type: 'int', default: 0, comment: '限购数量（0表示不限购）' })
  limitBuy: number;

  @Column({ type: 'int', default: 0, comment: '分类ID' })
  categoryId: number;

  @Column({ length: 50, nullable: true, comment: '分类名称' })
  categoryName: string;

  @Column({ default: true, comment: '是否上架' })
  isShow: boolean;

  @Column({ type: 'int', default: 0, comment: '排序权重' })
  sortOrder: number;

  @Column({ type: 'int', default: 1, comment: '兑换方式：1-仅积分，2-积分+现金' })
  exchangeType: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    comment: '现金金额（当exchangeType为2时使用）',
  })
  cashAmount: number;

  @Column({ type: 'text', nullable: true, comment: '商品详情' })
  detail: string;

  @Column({ type: 'int', default: 0, comment: '商品类型：1-实物商品，2-虚拟商品（如优惠券）' })
  goodsType: number;

  @Column({ length: 100, nullable: true, comment: '虚拟商品关联ID（如优惠券ID）' })
  virtualGoodsId: string;

  @Column({ default: false, comment: '是否推荐' })
  isRecommend: boolean;

  @Column({ default: false, comment: '是否热门' })
  isHot: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;

  @Column({ default: false, comment: '是否删除' })
  deleted: boolean;
}
