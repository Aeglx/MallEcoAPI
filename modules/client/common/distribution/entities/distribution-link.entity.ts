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

@Entity('distribution_link')
@Index(['distributionId'])
@Index(['linkCode'])
@Index(['status'])
export class DistributionLink {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'distribution_id', type: 'bigint', comment: '分销员ID' })
  distributionId: string;

  @Column({ name: 'link_code', type: 'varchar', length: 32, unique: true, comment: '推广链接码' })
  linkCode: string;

  @Column({ name: 'link_url', type: 'varchar', length: 500, comment: '推广链接URL' })
  linkUrl: string;

  @Column({ name: 'qr_code_url', type: 'varchar', length: 500, nullable: true, comment: '二维码URL' })
  qrCodeUrl: string;

  @Column({ name: 'poster_url', type: 'varchar', length: 500, nullable: true, comment: '海报URL' })
  posterUrl: string;

  @Column({ name: 'link_title', type: 'varchar', length: 200, nullable: true, comment: '链接标题' })
  linkTitle: string;

  @Column({ name: 'link_description', type: 'varchar', length: 500, nullable: true, comment: '链接描述' })
  linkDescription: string;

  @Column({ name: 'share_image', type: 'varchar', length: 500, nullable: true, comment: '分享图片' })
  shareImage: string;

  @Column({
    type: 'enum',
    enum: ['default', 'custom', 'product', 'activity'],
    default: 'default',
    comment: '链接类型：default-默认链接，custom-自定义链接，product-商品链接，activity-活动链接'
  })
  linkType: string;

  @Column({ name: 'product_id', type: 'bigint', nullable: true, comment: '关联商品ID' })
  productId: string;

  @Column({ name: 'activity_id', type: 'bigint', nullable: true, comment: '关联活动ID' })
  activityId: string;

  @Column({ name: 'custom_params', type: 'text', nullable: true, comment: '自定义参数' })
  customParams: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
    comment: '状态：active-启用，inactive-禁用'
  })
  status: string;

  @Column({ name: 'click_count', type: 'int', default: 0, comment: '点击次数' })
  clickCount: number;

  @Column({ name: 'uv_count', type: 'int', default: 0, comment: '访客数' })
  uvCount: number;

  @Column({ name: 'order_count', type: 'int', default: 0, comment: '订单数' })
  orderCount: number;

  @Column({ name: 'order_amount', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '订单金额' })
  orderAmount: number;

  @Column({ name: 'commission_amount', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '佣金金额' })
  commissionAmount: number;

  @Column({ name: 'convert_rate', type: 'decimal', precision: 5, scale: 2, default: 0, comment: '转化率' })
  convertRate: number;

  @Column({ name: 'expire_time', type: 'datetime', nullable: true, comment: '过期时间' })
  expireTime: Date;

  @Column({ name: 'last_click_time', type: 'datetime', nullable: true, comment: '最后点击时间' })
  lastClickTime: Date;

  @Column({ name: 'remark', type: 'text', nullable: true, comment: '备注' })
  remark: string;

  // 关联关系
  @ManyToOne(() => Distribution)
  distribution: Distribution;

  @CreateDateColumn({ name: 'create_time', type: 'datetime', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', type: 'datetime', comment: '更新时间' })
  updateTime: Date;
}