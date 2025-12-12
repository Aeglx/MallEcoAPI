import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsEnum, IsString } from 'class-validator';
import { MessageStatus } from '../entities/enums/message-status.enum';

export class CreateStoreMessageDto {
  @ApiProperty({ description: '店铺ID', required: false })
  @IsOptional()
  storeId?: string;

  @ApiProperty({ description: '店铺名称', required: false })
  @IsOptional()
  storeName?: string;

  @ApiProperty({ description: '消息标题', required: true })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '消息内容', required: true })
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: '消息类型', enum: ['system', 'order', 'promotion', 'custom'], required: true })
  @IsEnum(['system', 'order', 'promotion', 'custom'])
  messageType: string;
}

export class UpdateStoreMessageDto {
  @ApiProperty({ description: '消息状态', enum: MessageStatus, required: true })
  @IsEnum(MessageStatus)
  status: MessageStatus;
}

export class QueryStoreMessageDto {
  @ApiProperty({ description: '店铺ID', required: false })
  @IsOptional()
  storeId?: string;

  @ApiProperty({ description: '消息类型', enum: ['system', 'order', 'promotion', 'custom'], required: false })
  @IsOptional()
  @IsEnum(['system', 'order', 'promotion', 'custom'])
  messageType?: string;

  @ApiProperty({ description: '是否已读', required: false })
  @IsOptional()
  isRead?: boolean;

  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ description: '每页数量', required: false, default: 10 })
  @IsOptional()
  limit?: number;
}

export class StoreMessageStatisticsDto {
  @ApiProperty({ description: '未读消息数量' })
  unreadCount: number;

  @ApiProperty({ description: '系统消息数量' })
  systemCount: number;

  @ApiProperty({ description: '订单消息数量' })
  orderCount: number;

  @ApiProperty({ description: '促销消息数量' })
  promotionCount: number;
}
