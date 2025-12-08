import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StoreMessageService } from '../services/store-message.service';
import { CreateStoreMessageDto, QueryStoreMessageDto, UpdateStoreMessageDto } from '../dto/store-message.dto';
import { StoreMessage } from '../entities/store-message.entity';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('店铺消息管理')
@ApiBearerAuth()
@Controller('store/messages')
@UseGuards(AuthGuard, RolesGuard)
export class StoreMessageController {
  constructor(private readonly storeMessageService: StoreMessageService) {}

  @ApiOperation({ summary: '创建店铺消息' })
  @ApiResponse({ status: 201, description: '消息创建成功', type: StoreMessage })
  @Roles('admin', 'manager')
  @Post()
  async createMessage(@Body() createStoreMessageDto: CreateStoreMessageDto): Promise<StoreMessage> {
    return this.storeMessageService.createMessage(createStoreMessageDto);
  }

  @ApiOperation({ summary: '批量创建店铺消息' })
  @ApiResponse({ status: 201, description: '消息批量创建成功', type: [StoreMessage] })
  @Roles('admin', 'manager')
  @Post('batch')
  async createBatchMessage(@Body() messages: CreateStoreMessageDto[]): Promise<StoreMessage[]> {
    return this.storeMessageService.createBatchMessage(messages);
  }

  @ApiOperation({ summary: '发送消息给所有店铺' })
  @ApiResponse({ status: 200, description: '消息发送成功' })
  @Roles('admin', 'manager')
  @Post('broadcast')
  async sendMessageToAllStores(@Body() createStoreMessageDto: CreateStoreMessageDto): Promise<void> {
    return this.storeMessageService.sendMessageToAllStores(createStoreMessageDto);
  }

  @ApiOperation({ summary: '获取消息详情' })
  @ApiResponse({ status: 200, description: '消息获取成功', type: StoreMessage })
  @Roles('admin', 'manager', 'seller')
  @Get(':id')
  async getMessageById(@Param('id') id: string): Promise<StoreMessage> {
    return this.storeMessageService.getMessageById(id);
  }

  @ApiOperation({ summary: '更新消息状态' })
  @ApiResponse({ status: 200, description: '消息状态更新成功', type: StoreMessage })
  @Roles('admin', 'manager', 'seller')
  @Put(':id/status')
  async updateMessageStatus(
    @Param('id') id: string,
    @Body() updateStoreMessageDto: UpdateStoreMessageDto
  ): Promise<StoreMessage> {
    return this.storeMessageService.updateMessageStatus(id, updateStoreMessageDto);
  }

  @ApiOperation({ summary: '标记所有消息为已读' })
  @ApiResponse({ status: 200, description: '消息标记成功', type: Number })
  @Roles('admin', 'manager', 'seller')
  @Put('mark-all-read')
  async markAllAsRead(@Query('storeId') storeId: string): Promise<number> {
    return this.storeMessageService.markAllAsRead(storeId);
  }

  @ApiOperation({ summary: '删除消息' })
  @ApiResponse({ status: 200, description: '消息删除成功' })
  @Roles('admin', 'manager', 'seller')
  @Delete(':id')
  async deleteMessage(@Param('id') id: string): Promise<void> {
    return this.storeMessageService.deleteMessage(id);
  }

  @ApiOperation({ summary: '删除所有消息' })
  @ApiResponse({ status: 200, description: '消息删除成功', type: Number })
  @Roles('admin', 'manager', 'seller')
  @Delete()
  async deleteAll(@Query('storeId') storeId: string): Promise<number> {
    return this.storeMessageService.deleteAll(storeId);
  }

  @ApiOperation({ summary: '获取消息列表' })
  @ApiResponse({ status: 200, description: '消息列表获取成功' })
  @Roles('admin', 'manager', 'seller')
  @Get()
  async getMessages(@Query() query: QueryStoreMessageDto): Promise<{ data: StoreMessage[]; total: number }> {
    return this.storeMessageService.getMessages(query);
  }

  @ApiOperation({ summary: '获取消息统计' })
  @ApiResponse({ status: 200, description: '消息统计获取成功' })
  @Roles('admin', 'manager', 'seller')
  @Get('statistics')
  async getMessageStatistics(@Query('storeId') storeId: string): Promise<{ unreadCount: number; totalCount: number }> {
    return this.storeMessageService.getMessageStatistics(storeId);
  }

  @ApiOperation({ summary: '获取消息类型统计' })
  @ApiResponse({ status: 200, description: '消息类型统计获取成功' })
  @Roles('admin', 'manager', 'seller')
  @Get('statistics/type')
  async getMessageCountByType(@Query('storeId') storeId: string): Promise<{ [key: string]: number }> {
    return this.storeMessageService.getMessageCountByType(storeId);
  }
}
