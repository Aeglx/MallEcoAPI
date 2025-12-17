import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('IM服务-消息管理')
@Controller('im/message')
export class MessageController {
  
  @Post('send')
  @ApiOperation({ summary: '发送消息' })
  sendMessage(@Body() messageData: {
    toUserId: string;
    content: string;
    messageType: 'text' | 'image' | 'file';
  }) {
    return {
      messageId: Date.now().toString(),
      sendTime: new Date().toISOString(),
      status: 'sent'
    };
  }

  @Get('history/:userId')
  @ApiOperation({ summary: '获取消息历史' })
  getMessageHistory(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('size') size: number = 20
  ) {
    return {
      messages: [
        {
          id: '1',
          fromUserId: 'user1',
          toUserId: userId,
          content: '你好，有什么可以帮助您的？',
          messageType: 'text',
          sendTime: '2024-01-01T10:00:00Z'
        }
      ],
      total: 1,
      page,
      size
    };
  }

  @Get('unread/:userId')
  @ApiOperation({ summary: '获取未读消息数' })
  getUnreadCount(@Param('userId') userId: string) {
    return {
      unreadCount: 3,
      lastMessageTime: '2024-01-01T10:30:00Z'
    };
  }

  @Post('read')
  @ApiOperation({ summary: '标记消息为已读' })
  markAsRead(@Body() readData: { messageIds: string[]; userId: string }) {
    return {
      success: true,
      readCount: readData.messageIds.length
    };
  }

  @Get('conversations/:userId')
  @ApiOperation({ summary: '获取会话列表' })
  getConversations(@Param('userId') userId: string) {
    return [
      {
        conversationId: 'conv1',
        targetUserId: 'user2',
        targetUserName: '客服小张',
        lastMessage: '您好，有什么可以帮助您的？',
        lastMessageTime: '2024-01-01T10:00:00Z',
        unreadCount: 2
      }
    ];
  }
}