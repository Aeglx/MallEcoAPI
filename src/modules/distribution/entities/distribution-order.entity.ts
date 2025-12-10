import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDate } from 'class-validator';
import { DistributionOrderStatusEnum } from '../enums/distribution-order-status.enum';

@Entity('li_distribution_order')
export class DistributionOrder {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: '分销订单ID' })
  id: string;

  @CreateDateColumn({ 
    name: 'create_time', 
    type: 'datetime', 
    comment: '创建时间' 
  })
  @ApiProperty({ description: '创建时间' })
  createTime: Date;

  @Column({ 
    name: 'distribution_order_status', 
    type: 'enum', 
    enum: DistributionOrderStatusEnum, 
    default: DistributionOrderStatusEnum.NO_COMPLETED,
    comment: '分销订单状态' 
  })
  @ApiProperty({ 
    description: '分销订单状态', 
    enum: DistributionOrderStatusEnum 
  })
  @IsString()
  @IsOptional()
  distributionOrderStatus: DistributionOrderStatusEnum;

  @Column({ name: 'member_id', comment: '购买会员的id' })
  @ApiProperty({ description: '购买会员的id' })
  @IsString()
  @IsOptional()
  memberId: string;

  @Column({ name: 'member_name', comment: '购买会员的名称' })
  @ApiProperty({ description: '购买会员的名称' })
  @IsString()
  @IsOptional()
  memberName: string;

  @Column({ name: 'distribution_id', comment: '分销员id' })
  @ApiProperty({ description: '分销员id' })
  @IsString()
  @IsOptional()
  distributionId: string;

  @Column({ name: 'distribution_name', comment: '分销员名称' })
  @ApiProperty({ description: '分销员名称' })
  @IsString()
  @IsOptional()
  distributionName: string;

  @Column({ 
    name: 'settle_cycle', 
    type: 'datetime', 
    comment: '解冻日期',
    nullable: true 
  })
  @ApiProperty({ description: '解冻日期' })
  @IsDate()
  @IsOptional()
  settleCycle: Date;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    comment: '提成金额' 
  })
  @ApiProperty({ description: '提成金额' })
  @IsNumber()
  @IsOptional()
  rebate: number;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    default: 0,
    name: 'sell_back_rebate',
    comment: '退款金额' 
  })
  @ApiProperty({ description: '退款金额' })
  @IsNumber()
  @IsOptional()
  sellBackRebate: number = 0;

  @Column({ name: 'store_id', comment: '店铺id' })
  @ApiProperty({ description: '店铺id' })
  @IsString()
  @IsOptional()
  storeId: string;

  @Column({ name: 'store_name', comment: '店铺名称' })
  @ApiProperty({ description: '店铺名称' })
  @IsString()
  @IsOptional()
  storeName: string;

  @Column({ name: 'order_sn', comment: '订单编号' })
  @ApiProperty({ description: '订单编号' })
  @IsString()
  @IsOptional()
  orderSn: string;

  @Column({ name: 'order_item_sn', comment: '子订单编号' })
  @ApiProperty({ description: '子订单编号' })
  @IsString()
  @IsOptional()
  orderItemSn: string;

  @Column({ name: 'goods_id', comment: '商品ID' })
  @ApiProperty({ description: '商品ID' })
  @IsString()
  @IsOptional()
  goodsId: string;

  @Column({ name: 'goods_name', comment: '商品名称' })
  @ApiProperty({ description: '商品名称' })
  @IsString()
  @IsOptional()
  goodsName: string;

  @Column({ name: 'sku_id', comment: '货品ID' })
  @ApiProperty({ description: '货品ID' })
  @IsString()
  @IsOptional()
  skuId: string;

  @Column({ comment: '规格' })
  @ApiProperty({ description: '规格' })
  @IsString()
  @IsOptional()
  specs: string;

  @Column({ comment: '图片' })
  @ApiProperty({ description: '图片' })
  @IsString()
  @IsOptional()
  image: string;

  @Column({ type: 'int', comment: '商品数量' })
  @ApiProperty({ description: '商品数量' })
  @IsNumber()
  @IsOptional()
  num: number;

  @Column({ 
    type: 'int', 
    default: 0,
    name: 'refund_num',
    comment: '退款商品数量' 
  })
  @ApiProperty({ description: '退款商品数量' })
  @IsNumber()
  @IsOptional()
  refundNum: number = 0;

  @Column({ name: 'delete_flag', type: 'boolean', default: false, comment: '删除标志' })
  @ApiProperty({ description: '删除标志' })
  @IsOptional()
  deleteFlag: boolean = false;
}