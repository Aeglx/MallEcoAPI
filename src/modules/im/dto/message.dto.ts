import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { MessageTypeEnum } from '../enums/message-type.enum';

/**
 * 发送消息DTO
 */
export class SendMessageDto {
  @ApiProperty({ description: '接收用户ID', example: 'user123' })
  @IsString()
  @IsNotEmpty()
  toUserId: string;

  @ApiProperty({ description: '消息内容', example: '你好，有什么可以帮助您的？' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: '消息类型',
    enum: MessageTypeEnum,
    default: MessageTypeEnum.MESSAGE,
    example: MessageTypeEnum.MESSAGE,
  })
  @IsEnum(MessageTypeEnum)
  @IsOptional()
  messageType?: MessageTypeEnum;

  @ApiPropertyOptional({ description: '聊天会话ID', example: 'talk123' })
  @IsString()
  @IsOptional()
  talkId?: string;
}

/**
 * 获取消息历史DTO
 */
export class GetMessageHistoryDto {
  @ApiProperty({ description: '用户ID', example: 'user123' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({
    description: '页码',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  size?: number = 20;
}

/**
 * 标记已读DTO
 */
export class MarkAsReadDto {
  @ApiProperty({
    description: '消息ID列表',
    example: ['msg1', 'msg2', 'msg3'],
    type: [String],
  })
  @IsString({ each: true })
  @IsNotEmpty()
  messageIds: string[];

  @ApiProperty({ description: '用户ID', example: 'user123' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

/**
 * 消息响应DTO
 */
export class MessageResponseDto {
  @ApiProperty({ description: '消息ID', example: 'msg123' })
  id: string;

  @ApiProperty({ description: '发送用户ID', example: 'user1' })
  fromUserId: string;

  @ApiProperty({ description: '接收用户ID', example: 'user2' })
  toUserId: string;

  @ApiProperty({ description: '消息内容', example: '你好' })
  content: string;

  @ApiProperty({ description: '消息类型', enum: MessageTypeEnum })
  messageType: MessageTypeEnum;

  @ApiProperty({ description: '是否已读', example: false })
  isRead: boolean;

  @ApiProperty({ description: '发送时间', example: '2024-01-01T10:00:00Z' })
  sendTime: string;
}

/**
 * 消息历史响应DTO
 */
export class MessageHistoryResponseDto {
  @ApiProperty({ description: '消息列表', type: [MessageResponseDto] })
  messages: MessageResponseDto[];

  @ApiProperty({ description: '总数量', example: 100 })
  total: number;

  @ApiProperty({ description: '当前页码', example: 1 })
  page: number;

  @ApiProperty({ description: '每页数量', example: 20 })
  size: number;
}

/**
 * 未读消息数响应DTO
 */
export class UnreadCountResponseDto {
  @ApiProperty({ description: '未读消息数', example: 3 })
  unreadCount: number;

  @ApiProperty({ description: '最后消息时间', example: '2024-01-01T10:30:00Z' })
  lastMessageTime: string;
}

/**
 * 会话信息DTO
 */
export class ConversationDto {
  @ApiProperty({ description: '会话ID', example: 'conv1' })
  conversationId: string;

  @ApiProperty({ description: '目标用户ID', example: 'user2' })
  targetUserId: string;

  @ApiProperty({ description: '目标用户名', example: '客服小张' })
  targetUserName: string;

  @ApiProperty({ description: '最后一条消息', example: '您好，有什么可以帮助您的？' })
  lastMessage: string;

  @ApiProperty({ description: '最后消息时间', example: '2024-01-01T10:00:00Z' })
  lastMessageTime: string;

  @ApiProperty({ description: '未读消息数', example: 2 })
  unreadCount: number;
}
