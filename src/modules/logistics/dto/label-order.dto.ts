import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SenderInfo {
  @ApiProperty({ description: '发件人姓名', required: true })
  @IsNotEmpty({ message: '发件人姓名不能为空' })
  @IsString()
  name: string;

  @ApiProperty({ description: '发件人电话', required: true })
  @IsNotEmpty({ message: '发件人电话不能为空' })
  @IsString()
  phone: string;

  @ApiProperty({ description: '发件人地址', required: true })
  @IsNotEmpty({ message: '发件人地址不能为空' })
  @IsString()
  address: string;

  @ApiProperty({ description: '发件人城市', required: true })
  @IsNotEmpty({ message: '发件人城市不能为空' })
  @IsString()
  city: string;

  @ApiProperty({ description: '发件人省份', required: true })
  @IsNotEmpty({ message: '发件人省份不能为空' })
  @IsString()
  province: string;

  @ApiProperty({ description: '发件人邮编', required: false })
  @IsOptional()
  @IsString()
  zipCode?: string;
}

export class ReceiverInfo {
  @ApiProperty({ description: '收件人姓名', required: true })
  @IsNotEmpty({ message: '收件人姓名不能为空' })
  @IsString()
  name: string;

  @ApiProperty({ description: '收件人电话', required: true })
  @IsNotEmpty({ message: '收件人电话不能为空' })
  @IsString()
  phone: string;

  @ApiProperty({ description: '收件人地址', required: true })
  @IsNotEmpty({ message: '收件人地址不能为空' })
  @IsString()
  address: string;

  @ApiProperty({ description: '收件人城市', required: true })
  @IsNotEmpty({ message: '收件人城市不能为空' })
  @IsString()
  city: string;

  @ApiProperty({ description: '收件人省份', required: true })
  @IsNotEmpty({ message: '收件人省份不能为空' })
  @IsString()
  province: string;

  @ApiProperty({ description: '收件人邮编', required: false })
  @IsOptional()
  @IsString()
  zipCode?: string;
}

export class PackageInfo {
  @ApiProperty({ description: '包裹数量', required: true })
  @IsNotEmpty({ message: '包裹数量不能为空' })
  count: number;

  @ApiProperty({ description: '包裹重量', required: true })
  @IsNotEmpty({ message: '包裹重量不能为空' })
  weight: number;

  @ApiProperty({ description: '包裹尺寸', required: false })
  @IsOptional()
  size?: string;

  @ApiProperty({ description: '商品名称', required: false })
  @IsOptional()
  commodityName?: string;
}

export class LabelOrderDTO {
  @ApiProperty({ description: '物流公司ID', required: true })
  @IsNotEmpty({ message: '物流公司ID不能为空' })
  @IsString()
  logisticsId: string;

  @ApiProperty({ description: '发件人信息', required: true })
  @IsNotEmpty({ message: '发件人信息不能为空' })
  senderInfo: SenderInfo;

  @ApiProperty({ description: '收件人信息', required: true })
  @IsNotEmpty({ message: '收件人信息不能为空' })
  receiverInfo: ReceiverInfo;

  @ApiProperty({ description: '包裹信息', required: true })
  @IsNotEmpty({ message: '包裹信息不能为空' })
  packageInfo: PackageInfo;

  @ApiProperty({ description: '订单号', required: true })
  @IsNotEmpty({ message: '订单号不能为空' })
  @IsString()
  orderNo: string;

  @ApiProperty({ description: '附加参数', required: false })
  @IsOptional()
  extraParams?: Record<string, any>;
}
