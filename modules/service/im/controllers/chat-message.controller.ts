import { Controller, Get, Post, Body, Patch, Delete, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ChatMessageService } from '../services/chat-message.service';
import { CreateChatMessageDto, UpdateChatMessageDto, QueryChatMessageDto, MarkReadDto } from '../dto/chat-message.dto';
import { ChatMessage } from '../entities/chat-message.entity';

@ApiTags('聊天消息')
@Controller('chat/messages')
export class ChatMessageController {
  constructor(private readonly chatMessageService: ChatMessageService) {}

  @Post()
  @ApiOperation({ summary: '发送消息' })
  @ApiResponse({ status: 201, description: '消息发送成功', type: ChatMessage })
  async createChatMessage(@Body() createChatMessageDto: CreateChatMessageDto) {
    return await this.chatMessageService.createChatMessage(createChatMessageDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取消息详情' })
  @ApiParam({ name: 'id', description: '消息ID' })
  @ApiResponse({ status: 200, description: '获取消息详情成功', type: ChatMessage })
  async getChatMessageById(@Param('id') id: string) {
    return await this.chatMessageService.getChatMessageById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新消息' })
  @ApiParam({ name: 'id', description: '消息ID' })
  @ApiResponse({ status: 200, description: '更新消息成功', type: ChatMessage })
  async updateChatMessage(@Param('id') id: string, @Body() updateChatMessageDto: UpdateChatMessageDto) {
    return await this.chatMessageService.updateChatMessage(id, updateChatMessageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除消息' })
  @ApiParam({ name: 'id', description: '消息ID' })
  @ApiResponse({ status: 200, description: '删除消息成功' })
  async deleteChatMessage(@Param('id') id: string) {
    return await this.chatMessageService.deleteChatMessage(id);
  }

  @Get()
  @ApiOperation({ summary: '获取消息列表' })
  @ApiQuery({ name: 'chatRoomId', description: '聊天房间ID' })
  @ApiQuery({ name: 'page', description: '页码', required: false })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false })
  @ApiQuery({ name: 'isRead', description: '是否已读', required: false })
  @ApiResponse({ status: 200, description: '获取消息列表成功' })
  async getChatMessages(@Query() query: QueryChatMessageDto) {
    return await this.chatMessageService.getChatMessages(query);
  }

  @Post('mark-read')
  @ApiOperation({ summary: '标记消息为已读' })
  @ApiResponse({ status: 200, description: '标记消息为已读成功' })
  async markMessagesAsRead(@Body() markReadDto: MarkReadDto) {
    return await this.chatMessageService.markMessagesAsRead(markReadDto);
  }

  @Get('unread-count/:chatRoomId')
  @ApiOperation({ summary: '获取未读消息数量' })
  @ApiParam({ name: 'chatRoomId', description: '聊天房间ID' })
  @ApiResponse({ status: 200, description: '获取未读消息数量成功' })
  async getUnreadCount(@Param('chatRoomId') chatRoomId: string) {
    return await this.chatMessageService.getUnreadCount(chatRoomId);
  }
}
