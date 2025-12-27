import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { LiveRoom } from './live-room.entity';

@Entity('mall_live_goods')
@Index(['liveRoomId', 'productId'], { unique: true })
export class LiveGoods extends BaseEntity {
  @Column({ name: 'live_room_id', nullable: false, comment: '直播间ID' })
  liveRoomId: string;

  @Column({ name: 'product_id', nullable: false, comment: '商品ID' })
  productId: string;

  @Column({ name: 'product_name', length: 255, nullable: false, comment: '商品名称' })
  productName: string;

  @Column({ name: 'product_image', length: 255, nullable: false, comment: '商品图片' })
  productImage: string;

  @Column({
    name: 'original_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: '原价',
  })
  originalPrice: number;

  @Column({
    name: 'live_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    comment: '直播价',
  })
  livePrice: number;

  @Column({ name: 'stock', default: 0, comment: '库存' })
  stock: number;

  @Column({ name: 'sold_count', default: 0, comment: '已售数量' })
  soldCount: number;

  @Column({ name: 'sort_order', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({ name: 'is_hot', type: 'tinyint', default: 0, comment: '是否热门' })
  isHot: number;

  @Column({ name: 'is_on_shelf', type: 'tinyint', default: 1, comment: '是否上架' })
  isOnShelf: number;

  @ManyToOne(() => LiveRoom, liveRoom => liveRoom.liveGoods)
  @JoinColumn({ name: 'live_room_id' })
  liveRoom: LiveRoom;
}
