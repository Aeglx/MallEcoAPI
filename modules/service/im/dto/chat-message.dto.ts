import { IsString, IsOptional, IsEnum, IsBoolean, IsUUID, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatMessageDto {
  @ApiProperty({
    description: '聊天房间ID',
    example: 'uuid-of-chat-room'
  })
  @IsUUID()
  chatRoomId: string;

  @ApiProperty({
    description: '发送者ID',
    example: 'uuid-of-sender'
  })
  @IsString()
  senderId: string;

  @ApiProperty({
    description: '接收者ID（单聊时使用）',
    example: 'uuid-of-receiver',
    required: false
  })
  @IsOptional()
  @IsString()
  receiverId?: string;

  @ApiProperty({
    description: '消息内容',
    example: '你好，欢迎加入聊天'
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: '消息类型',
    enum: ['text', 'image', 'voice', 'video'],
    default: 'text'
  })
  @IsOptional()
  @IsEnum(['text', 'image', 'voice', 'video'])
  type?: string;
}

export class UpdateChatMessageDto {
  @ApiProperty({
    description: '消息内容',
    example: '你好，欢迎加入聊天',
    required: false
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: '是否已读',
    default: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiProperty({
    description: '是否删除',
    default: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}

export class QueryChatMessageDto {
  @ApiProperty({
    description: '聊天房间ID',
    example: 'uuid-of-chat-room'
  })
  @IsUUID()
  chatRoomId: string;

  @ApiProperty({
    description: '页码',
    default: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({
    description: '每页数量',
    default: 10,
    required: false
  })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiProperty({
    description: '是否已读',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}

export class MarkReadDto {
  @ApiProperty({
    description: '消息ID列表',
    example: ['uuid-of-message-1', 'uuid-of-message-2']
  })
  @IsUUID('all', { each: true })
  messageIds: string[];
}
