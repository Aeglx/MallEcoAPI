import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LiveRoom } from './live-room.entity';

@Entity('live_goods')
export class LiveGoods {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 64, comment: '直播间ID' })
  liveRoomId: string;

  @Column({ length: 64, comment: '商品ID' })
  goodsId: string;

  @Column({ length: 255, comment: '商品名称' })
  goodsName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '商品原价' })
  originalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '直播价格' })
  livePrice: number;

  @Column({ type: 'int', default: 0, comment: '直播库存' })
  liveStock: number;

  @Column({ type: 'int', default: 0, comment: '已售数量' })
  soldCount: number;

  @Column({ type: 'int', default: 0, comment: '剩余库存' })
  remainingStock: number;

  @Column({ type: 'int', default: 0, comment: '排序权重' })
  sortWeight: number;

  @Column({ type: 'boolean', default: true, comment: '是否上架' })
  isOnSale: boolean;

  @Column({ type: 'datetime', nullable: true, comment: '上架时间' })
  onSaleTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '下架时间' })
  offSaleTime: Date;

  @Column({ type: 'boolean', default: false, comment: '是否主推商品' })
  isMainGoods: boolean;

  @Column({ type: 'text', nullable: true, comment: '商品描述' })
  description: string;

  @Column({ length: 255, nullable: true, comment: '商品图片' })
  imageUrl: string;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @ManyToOne(() => LiveRoom, liveRoom => liveRoom.liveGoods)
  @JoinColumn({ name: 'liveRoomId' })
  liveRoom: LiveRoom;
}