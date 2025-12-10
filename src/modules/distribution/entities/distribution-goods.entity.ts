import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsOptional, Max } from 'class-validator';

@Entity('li_distribution_goods')
export class DistributionGoods {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: '分销商品ID' })
  id: string;

  @Column({ name: 'goods_id', comment: '商品ID' })
  @ApiProperty({ description: '商品ID', required: true })
  @IsString()
  @IsNotEmpty({ message: '商品ID不能为空' })
  goodsId: string;

  @Column({ name: 'goods_name', comment: '商品名称' })
  @ApiProperty({ description: '商品名称' })
  @IsString()
  @IsOptional()
  goodsName: string;

  @Column({ name: 'sku_id', comment: '规格ID' })
  @ApiProperty({ description: '规格ID', required: true })
  @IsString()
  @IsNotEmpty({ message: '规格ID不能为空' })
  skuId: string;

  @Column({ type: 'text', comment: '规格信息json', select: false })
  @ApiProperty({ description: '规格信息json' })
  @IsString()
  @IsOptional()
  specs: string;

  @Column({ name: 'store_id', comment: '店铺ID' })
  @ApiProperty({ description: '店铺ID' })
  @IsString()
  @IsNotEmpty({ message: '店铺ID不能为空' })
  storeId: string;

  @Column({ name: 'store_name', comment: '店铺名称' })
  @ApiProperty({ description: '店铺名称' })
  @IsString()
  @IsNotEmpty({ message: '店铺名称不能为空' })
  storeName: string;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    default: 0, 
    comment: '佣金金额' 
  })
  @ApiProperty({ description: '佣金金额', required: true })
  @IsNumber()
  @IsNotEmpty({ message: '佣金金额不能为空' })
  commission: number = 0;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    comment: '商品价格',
    nullable: true 
  })
  @ApiProperty({ description: '商品价格' })
  @IsNumber()
  @Max(99999999, { message: '价格不能超过99999999' })
  @IsOptional()
  price: number;

  @Column({ comment: '缩略图路径' })
  @ApiProperty({ description: '缩略图路径' })
  @IsString()
  @IsOptional()
  thumbnail: string;

  @Column({ 
    type: 'int', 
    comment: '库存',
    nullable: true 
  })
  @ApiProperty({ description: '库存' })
  @IsNumber()
  @Max(99999999, { message: '库存不能超过99999999' })
  @IsOptional()
  quantity: number;

  @CreateDateColumn({ 
    name: 'create_time', 
    type: 'datetime', 
    comment: '创建时间' 
  })
  @ApiProperty({ description: '创建时间' })
  createTime: Date;

  @Column({ name: 'create_by', comment: '创建者' })
  @ApiProperty({ description: '创建者' })
  @IsString()
  @IsOptional()
  createBy: string;

  @Column({ name: 'delete_flag', type: 'boolean', default: false, comment: '删除标志' })
  @ApiProperty({ description: '删除标志' })
  @IsOptional()
  deleteFlag: boolean = false;
}