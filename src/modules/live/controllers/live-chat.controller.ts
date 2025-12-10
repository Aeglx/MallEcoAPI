import { Controller, Post, Get, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LiveChatService } from '../services/live-chat.service';
import { CreateLiveChatDto } from '../dto/live-chat.dto';

@ApiTags('live-chat')
@Controller('live/chat')
export class LiveChatController {
  constructor(private readonly liveChatService: LiveChatService) {}

  @Post()
  @ApiOperation({ summary: '发送聊天消息' })
  @ApiResponse({ status: 201, description: '消息发送成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async sendMessage(@Body() createDto: CreateLiveChatDto) {
    // TODO: 从token中获取用户ID
    const userId = 'user123';
    return await this.liveChatService.sendChatMessage(createDto, userId);
  }

  @Get('room/:roomId/history')
  @ApiOperation({ summary: '获取聊天记录' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'size', required: false, description: '每页大小' })
  async getChatHistory(
    @Param('roomId') roomId: string,
    @Query('page') page: number = 1,
    @Query('size') size: number = 50
  ) {
    return await this.liveChatService.getChatHistory(roomId, page, size);
  }

  @Get('room/:roomId/unread-count')
  @ApiOperation({ summary: '获取未读消息数量' })
  @ApiQuery({ name: 'lastReadTime', required: true, description: '最后阅读时间' })
  async getUnreadMessageCount(
    @Param('roomId') roomId: string,
    @Query('lastReadTime') lastReadTime: string
  ) {
    const count = await this.liveChatService.getUnreadMessageCount(
      roomId,
      new Date(lastReadTime)
    );
    return { unreadCount: count };
  }

  @Delete('message/:messageId')
  @ApiOperation({ summary: '删除聊天消息' })
  @ApiResponse({ status: 200, description: '消息删除成功' })
  @ApiResponse({ status: 404, description: '消息不存在' })
  async deleteChatMessage(@Param('messageId') messageId: string) {
    // TODO: 从token中获取用户ID
    const userId = 'user123';
    await this.liveChatService.deleteChatMessage(messageId, userId);
    return { message: '消息删除成功' };
  }

  @Get('room/:roomId/online-users')
  @ApiOperation({ summary: '获取在线用户列表' })
  async getOnlineUsers(@Param('roomId') roomId: string) {
    return await this.liveChatService.getOnlineUsers(roomId);
  }
}