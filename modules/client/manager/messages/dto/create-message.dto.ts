import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { MessageType, ReceiverType, SenderType } from '../entities/message.entity';

export class CreateMessageDto {
  @ApiProperty({ description: '消息标题', example: '系统通知' })
  @IsNotEmpty({ message: '消息标题不能为空' })
  @IsString({ message: '消息标题必须是字符串' })
  title: string;

  @ApiProperty({ description: '消息内容', example: '这是一条系统通知' })
  @IsNotEmpty({ message: '消息内容不能为空' })
  @IsString({ message: '消息内容必须是字符串' })
  content: string;

  @ApiProperty({ description: '消息类型', example: 'system_notice', enum: MessageType })
  @IsNotEmpty({ message: '消息类型不能为空' })
  @IsEnum(MessageType, { message: '无效的消息类型' })
  messageType: MessageType;

  @ApiProperty({ description: '发送时间', example: '2024-01-01T12:00:00.000Z' })
  @IsOptional()
  sendTime?: Date;

  @ApiProperty({ description: '接收者ID', example: 'user123' })
  @IsOptional()
  @IsString({ message: '接收者ID必须是字符串' })
  receiverId?: string;

  @ApiProperty({ description: '接收者类型', example: 'user', enum: ReceiverType })
  @IsOptional()
  @IsEnum(ReceiverType, { message: '无效的接收者类型' })
  receiverType?: ReceiverType;

  @ApiProperty({ description: '发送者ID', example: 'system' })
  @IsOptional()
  @IsString({ message: '发送者ID必须是字符串' })
  senderId?: string;

  @ApiProperty({ description: '发送者类型', example: 'system', enum: SenderType })
  @IsOptional()
  @IsEnum(SenderType, { message: '无效的发送者类型' })
  senderType?: SenderType;

  @ApiProperty({ description: '扩展数据', example: { orderId: 'order123', productId: 'prod123' } })
  @IsOptional()
  extraData?: any;
}

export { QueryMessageDto } from './query-message.dto';
