import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLiveOrderDto {
  @ApiProperty({ description: '直播间ID', example: 'room123' })
  @IsNotEmpty({ message: '直播间ID不能为空' })
  @IsString({ message: '直播间ID必须是字符串' })
  liveRoomId: string;

  @ApiProperty({ description: '订单ID', example: 'order789' })
  @IsNotEmpty({ message: '订单ID不能为空' })
  @IsString({ message: '订单ID必须是字符串' })
  orderId: string;

  @ApiProperty({ description: '会员ID', example: 'member456' })
  @IsNotEmpty({ message: '会员ID不能为空' })
  @IsString({ message: '会员ID必须是字符串' })
  memberId: string;

  @ApiProperty({ description: '商品ID', example: 'goods123' })
  @IsNotEmpty({ message: '商品ID不能为空' })
  @IsString({ message: '商品ID必须是字符串' })
  goodsId: string;

  @ApiProperty({ description: '商品名称', example: 'iPhone 15 Pro' })
  @IsNotEmpty({ message: '商品名称不能为空' })
  @IsString({ message: '商品名称必须是字符串' })
  goodsName: string;

  @ApiProperty({ description: '购买数量', example: 1 })
  @IsNotEmpty({ message: '购买数量不能为空' })
  @IsNumber({}, { message: '购买数量必须是数字' })
  quantity: number;

  @ApiProperty({ description: '商品单价', example: 6999 })
  @IsNotEmpty({ message: '商品单价不能为空' })
  @IsNumber({}, { message: '商品单价必须是数字' })
  unitPrice: number;

  @ApiProperty({ description: '订单总金额', example: 6999 })
  @IsNotEmpty({ message: '订单总金额不能为空' })
  @IsNumber({}, { message: '订单总金额必须是数字' })
  totalAmount: number;

  @ApiProperty({ 
    description: '订单状态', 
    enum: ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDED'], 
    default: 'PENDING' 
  })
  @IsOptional()
  @IsEnum(['PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDED'], { 
    message: '订单状态必须是PENDING、PAID、SHIPPED、COMPLETED、CANCELLED或REFUNDED' 
  })
  status?: string;

  @ApiProperty({ description: '买家留言', example: '请尽快发货', required: false })
  @IsOptional()
  @IsString({ message: '买家留言必须是字符串' })
  buyerMessage?: string;
}