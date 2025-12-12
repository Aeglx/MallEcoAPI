import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LiveRoom } from './live-room.entity';

@Entity('live_order')
export class LiveOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 64, comment: '直播间ID' })
  liveRoomId: string;

  @Column({ length: 64, comment: '订单ID' })
  orderId: string;

  @Column({ length: 64, comment: '会员ID' })
  memberId: string;

  @Column({ length: 64, comment: '商品ID' })
  goodsId: string;

  @Column({ length: 255, comment: '商品名称' })
  goodsName: string;

  @Column({ type: 'int', comment: '购买数量' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '商品单价' })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '订单总金额' })
  totalAmount: number;

  @Column({ type: 'enum', enum: ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDED'], default: 'PENDING', comment: '订单状态' })
  status: string;

  @Column({ type: 'datetime', nullable: true, comment: '支付时间' })
  payTime: Date;

  @Column({ length: 64, nullable: true, comment: '支付方式' })
  paymentMethod: string;

  @Column({ length: 128, nullable: true, comment: '支付交易号' })
  paymentTransactionId: string;

  @Column({ type: 'boolean', default: false, comment: '是否退款' })
  isRefunded: boolean;

  @Column({ type: 'datetime', nullable: true, comment: '退款时间' })
  refundTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '退款金额' })
  refundAmount: number;

  @Column({ length: 255, nullable: true, comment: '退款原因' })
  refundReason: string;

  @Column({ type: 'text', nullable: true, comment: '买家留言' })
  buyerMessage: string;

  @Column({ type: 'boolean', default: false, comment: '是否评价' })
  isRated: boolean;

  @Column({ type: 'int', nullable: true, comment: '评价分数' })
  rating: number;

  @Column({ type: 'text', nullable: true, comment: '评价内容' })
  ratingComment: string;

  @Column({ type: 'datetime', nullable: true, comment: '评价时间' })
  ratingTime: Date;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @ManyToOne(() => LiveRoom, liveRoom => liveRoom.liveOrders)
  @JoinColumn({ name: 'liveRoomId' })
  liveRoom: LiveRoom;
}