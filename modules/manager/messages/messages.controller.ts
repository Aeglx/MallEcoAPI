import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { MessageService } from './messages.service';
import { CreateMessageDto, QueryMessageDto } from './dto/create-message.dto';
import { Message, MessageStatus } from './entities/message.entity';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard';

@ApiTags('消息管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('manager/messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOperation({ summary: '创建消息' })
  @ApiResponse({ status: 201, description: '消息创建成功', type: Message })
  @Post()
  async create(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
    return await this.messageService.create(createMessageDto);
  }

  @ApiOperation({ summary: '批量创建消息' })
  @ApiResponse({ status: 201, description: '消息批量创建成功', type: [Message] })
  @Post('batch')
  async createBatch(@Body() messages: CreateMessageDto[]): Promise<Message[]> {
    return await this.messageService.createBatch(messages);
  }

  @ApiOperation({ summary: '查询消息列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', type: Number })
  @ApiQuery({ name: 'title', required: false, description: '消息标题', type: String })
  @ApiQuery({ name: 'messageType', required: false, description: '消息类型', type: String })
  @ApiQuery({ name: 'status', required: false, description: '消息状态', type: String })
  @ApiQuery({ name: 'receiverId', required: false, description: '接收者ID', type: String })
  @ApiQuery({ name: 'receiverType', required: false, description: '接收者类型', type: String })
  @ApiQuery({ name: 'senderId', required: false, description: '发送者ID', type: String })
  @ApiQuery({ name: 'senderType', required: false, description: '发送者类型', type: String })
  @ApiQuery({ name: 'isRead', required: false, description: '是否已读', type: Boolean })
  @ApiQuery({ name: 'startTime', required: false, description: '开始时间', type: String })
  @ApiQuery({ name: 'endTime', required: false, description: '结束时间', type: String })
  @ApiResponse({ status: 200, description: '查询成功' })
  @Get()
  async findAll(@Query() queryDto: QueryMessageDto): Promise<{ data: Message[]; total: number }> {
    return await this.messageService.findAll(queryDto);
  }

  @ApiOperation({ summary: '查询单个消息' })
  @ApiParam({ name: 'id', description: '消息ID', type: String })
  @ApiResponse({ status: 200, description: '查询成功', type: Message })
  @ApiResponse({ status: 404, description: '消息不存在' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Message> {
    return await this.messageService.findOne(id);
  }

  @ApiOperation({ summary: '删除消息' })
  @ApiParam({ name: 'id', description: '消息ID', type: String })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '消息不存在' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.messageService.remove(id);
  }

  @ApiOperation({ summary: '批量删除消息' })
  @ApiResponse({ status: 200, description: '批量删除成功' })
  @Delete('batch')
  async removeBatch(@Body() ids: string[]): Promise<{ message: string; affected: number }> {
    return await this.messageService.removeBatch(ids);
  }

  @ApiOperation({ summary: '更新消息状态' })
  @ApiParam({ name: 'id', description: '消息ID', type: String })
  @ApiResponse({ status: 200, description: '状态更新成功', type: Message })
  @ApiResponse({ status: 404, description: '消息不存在' })
  @Patch(':id/status/:status')
  async updateStatus(@Param('id') id: string, @Param('status') status: MessageStatus): Promise<Message> {
    return await this.messageService.updateStatus(id, status);
  }

  @ApiOperation({ summary: '标记消息为已读' })
  @ApiParam({ name: 'id', description: '消息ID', type: String })
  @ApiResponse({ status: 200, description: '标记成功', type: Message })
  @ApiResponse({ status: 404, description: '消息不存在' })
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string): Promise<Message> {
    return await this.messageService.markAsRead(id);
  }

  @ApiOperation({ summary: '批量标记消息为已读' })
  @ApiResponse({ status: 200, description: '批量标记成功' })
  @Patch('batch/read')
  async markAsReadBatch(@Body() ids: string[]): Promise<{ message: string; affected: number }> {
    return await this.messageService.markAsReadBatch(ids);
  }

  @ApiOperation({ summary: '获取消息统计信息' })
  @ApiQuery({ name: 'startTime', required: false, description: '开始时间', type: String })
  @ApiQuery({ name: 'endTime', required: false, description: '结束时间', type: String })
  @ApiResponse({ status: 200, description: '统计成功' })
  @Get('statistics')
  async getStatistics(
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    return await this.messageService.getStatistics(startTime, endTime);
  }
}
