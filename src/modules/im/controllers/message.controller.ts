import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  SendMessageDto,
  GetMessageHistoryDto,
  MarkAsReadDto,
  MessageResponseDto,
  MessageHistoryResponseDto,
  UnreadCountResponseDto,
  ConversationDto,
} from '../dto/message.dto';
import { MessageTypeEnum } from '../enums/message-type.enum';
import {
  ApiCreateOperation,
  ApiGetOperation,
  ApiListOperation,
} from '../../../shared/decorators/swagger.decorator';

@ApiTags('即时通讯')
@Controller('im/message')
@ApiBearerAuth('JWT-auth')
export class MessageController {
  @Post('send')
  @ApiCreateOperation('发送消息', '向指定用户发送即时消息')
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({
    status: 200,
    description: '发送成功',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  sendMessage(@Body() messageData: SendMessageDto): MessageResponseDto {
    return {
      id: Date.now().toString(),
      fromUserId: 'current-user',
      toUserId: messageData.toUserId,
      content: messageData.content,
      messageType: messageData.messageType || MessageTypeEnum.MESSAGE,
      isRead: false,
      sendTime: new Date().toISOString(),
    };
  }

  @Get('history/:userId')
  @ApiListOperation('获取消息历史', '获取与指定用户的消息历史记录，支持分页')
  @ApiParam({ name: 'userId', description: '用户ID', example: 'user123' })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    type: MessageHistoryResponseDto,
  })
  getMessageHistory(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('size') size: number = 20,
  ): MessageHistoryResponseDto {
    return {
      messages: [
        {
          id: '1',
          fromUserId: 'user1',
          toUserId: userId,
          content: '你好，有什么可以帮助您的？',
          messageType: MessageTypeEnum.MESSAGE,
          isRead: false,
          sendTime: '2024-01-01T10:00:00Z',
        },
      ],
      total: 1,
      page,
      size,
    };
  }

  @Get('unread/:userId')
  @ApiGetOperation('获取未读消息数', '获取指定用户的未读消息数量')
  @ApiParam({ name: 'userId', description: '用户ID', example: 'user123' })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    type: UnreadCountResponseDto,
  })
  getUnreadCount(@Param('userId') userId: string): UnreadCountResponseDto {
    return {
      unreadCount: 3,
      lastMessageTime: '2024-01-01T10:30:00Z',
    };
  }

  @Post('read')
  @ApiOperation({ summary: '标记消息为已读', description: '将指定的消息标记为已读状态' })
  @ApiBody({ type: MarkAsReadDto })
  @ApiResponse({
    status: 200,
    description: '标记成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        readCount: { type: 'number', example: 3 },
      },
    },
  })
  @ApiResponse({ status: 400, description: '参数错误' })
  markAsRead(@Body() readData: MarkAsReadDto) {
    return {
      success: true,
      readCount: readData.messageIds.length,
    };
  }

  @Get('conversations/:userId')
  @ApiGetOperation('获取会话列表', '获取指定用户的所有会话列表')
  @ApiParam({ name: 'userId', description: '用户ID', example: 'user123' })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    type: [ConversationDto],
  })
  getConversations(@Param('userId') userId: string): ConversationDto[] {
    return [
      {
        conversationId: 'conv1',
        targetUserId: 'user2',
        targetUserName: '客服小张',
        lastMessage: '您好，有什么可以帮助您的？',
        lastMessageTime: '2024-01-01T10:00:00Z',
        unreadCount: 2,
      },
    ];
  }
}
