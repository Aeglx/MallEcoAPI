import { Controller, Get, Post, Body, Patch, Delete, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ChatRoomService } from '../services/chat-room.service';
import { CreateChatRoomDto, UpdateChatRoomDto, QueryChatRoomDto } from '../dto/chat-room.dto';
import { ChatRoom } from '../entities/chat-room.entity';

@ApiTags('聊天房间')
@Controller('chat/rooms')
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @Post()
  @ApiOperation({ summary: '创建聊天房间' })
  @ApiResponse({ status: 201, description: '聊天房间创建成功', type: ChatRoom })
  async createChatRoom(@Body() createChatRoomDto: CreateChatRoomDto) {
    return await this.chatRoomService.createChatRoom(createChatRoomDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取聊天房间详情' })
  @ApiParam({ name: 'id', description: '聊天房间ID' })
  @ApiResponse({ status: 200, description: '获取聊天房间详情成功', type: ChatRoom })
  async getChatRoomById(@Param('id') id: string) {
    return await this.chatRoomService.getChatRoomById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新聊天房间信息' })
  @ApiParam({ name: 'id', description: '聊天房间ID' })
  @ApiResponse({ status: 200, description: '更新聊天房间信息成功', type: ChatRoom })
  async updateChatRoom(@Param('id') id: string, @Body() updateChatRoomDto: UpdateChatRoomDto) {
    return await this.chatRoomService.updateChatRoom(id, updateChatRoomDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除聊天房间' })
  @ApiParam({ name: 'id', description: '聊天房间ID' })
  @ApiResponse({ status: 200, description: '删除聊天房间成功' })
  async deleteChatRoom(@Param('id') id: string) {
    return await this.chatRoomService.deleteChatRoom(id);
  }

  @Get()
  @ApiOperation({ summary: '获取聊天房间列表' })
  @ApiQuery({ name: 'page', description: '页码', required: false })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false })
  @ApiQuery({ name: 'type', description: '房间类型', enum: ['private', 'group'], required: false })
  @ApiQuery({ name: 'keyword', description: '搜索关键词', required: false })
  @ApiResponse({ status: 200, description: '获取聊天房间列表成功' })
  async getChatRooms(@Query() query: QueryChatRoomDto) {
    return await this.chatRoomService.getChatRooms(query);
  }
}
