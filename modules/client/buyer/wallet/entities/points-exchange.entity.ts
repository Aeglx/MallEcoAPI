import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { WalletEntity } from './wallet.entity';

@Entity('points_exchanges')
export class PointsExchangeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', comment: '用户ID' })
  userId: string;

  @Column({ name: 'product_id', comment: '积分商品ID' })
  productId: string;

  @Column({ name: 'product_name', type: 'varchar', length: 200, comment: '商品名称' })
  productName: string;

  @Column({ type: 'int', comment: '兑换数量' })
  quantity: number;

  @Column({ name: 'points_used', type: 'int', comment: '使用积分' })
  pointsUsed: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending',
    comment: '兑换状态',
  })
  status: string;

  @Column({ type: 'json', nullable: true, comment: '收货信息' })
  deliveryInfo: any;

  @Column({ type: 'datetime', nullable: true, comment: '发货时间' })
  shipTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '确认收货时间' })
  confirmTime: Date;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updated_at', type: 'datetime', comment: '更新时间' })
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => WalletEntity, wallet => wallet.pointsExchanges)
  wallet: WalletEntity;
}