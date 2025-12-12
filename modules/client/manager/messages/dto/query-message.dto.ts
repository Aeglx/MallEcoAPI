import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { MessageType, MessageStatus, ReceiverType, SenderType } from '../entities/message.entity';

export class QueryMessageDto {
  @ApiProperty({ description: '页码', example: 1, required: false })
  @IsOptional()
  page?: number;

  @ApiProperty({ description: '每页数量', example: 10, required: false })
  @IsOptional()
  limit?: number;

  @ApiProperty({ description: '消息标题（模糊查询）', example: '系统通知', required: false })
  @IsOptional()
  @IsString({ message: '消息标题必须是字符串' })
  title?: string;

  @ApiProperty({ description: '消息类型', example: 'system_notice', enum: MessageType, required: false })
  @IsOptional()
  @IsEnum(MessageType, { message: '无效的消息类型' })
  messageType?: MessageType;

  @ApiProperty({ description: '消息状态', example: 'sent', enum: MessageStatus, required: false })
  @IsOptional()
  @IsEnum(MessageStatus, { message: '无效的消息状态' })
  status?: MessageStatus;

  @ApiProperty({ description: '接收者ID', example: 'user123', required: false })
  @IsOptional()
  @IsString({ message: '接收者ID必须是字符串' })
  receiverId?: string;

  @ApiProperty({ description: '接收者类型', example: 'user', enum: ReceiverType, required: false })
  @IsOptional()
  @IsEnum(ReceiverType, { message: '无效的接收者类型' })
  receiverType?: ReceiverType;

  @ApiProperty({ description: '发送者ID', example: 'system', required: false })
  @IsOptional()
  @IsString({ message: '发送者ID必须是字符串' })
  senderId?: string;

  @ApiProperty({ description: '发送者类型', example: 'system', enum: SenderType, required: false })
  @IsOptional()
  @IsEnum(SenderType, { message: '无效的发送者类型' })
  senderType?: SenderType;

  @ApiProperty({ description: '是否已读', example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: '是否已读必须是布尔值' })
  isRead?: boolean;

  @ApiProperty({ description: '开始时间', example: '2024-01-01T00:00:00.000Z', required: false })
  @IsOptional()
  startTime?: Date;

  @ApiProperty({ description: '结束时间', example: '2024-01-31T23:59:59.000Z', required: false })
  @IsOptional()
  endTime?: Date;
}
