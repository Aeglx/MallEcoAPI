import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MemberMessageService } from '../services/member-message.service';
import { CreateMemberMessageDto, QueryMemberMessageDto, UpdateMemberMessageDto } from '../dto/member-message.dto';
import { MemberMessage } from '../entities/member-message.entity';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('会员消息管理')
@ApiBearerAuth()
@Controller('member/messages')
@UseGuards(AuthGuard, RolesGuard)
export class MemberMessageController {
  constructor(private readonly memberMessageService: MemberMessageService) {}

  @ApiOperation({ summary: '创建会员消息' })
  @ApiResponse({ status: 201, description: '消息创建成功', type: MemberMessage })
  @Roles('admin', 'manager')
  @Post()
  async createMessage(@Body() createMemberMessageDto: CreateMemberMessageDto): Promise<MemberMessage> {
    return this.memberMessageService.createMessage(createMemberMessageDto);
  }

  @ApiOperation({ summary: '批量创建会员消息' })
  @ApiResponse({ status: 201, description: '消息批量创建成功', type: [MemberMessage] })
  @Roles('admin', 'manager')
  @Post('batch')
  async createBatchMessage(@Body() messages: CreateMemberMessageDto[]): Promise<MemberMessage[]> {
    return this.memberMessageService.createBatchMessage(messages);
  }

  @ApiOperation({ summary: '发送消息给所有会员' })
  @ApiResponse({ status: 200, description: '消息发送成功' })
  @Roles('admin', 'manager')
  @Post('broadcast')
  async sendMessageToAllMembers(@Body() createMemberMessageDto: CreateMemberMessageDto): Promise<void> {
    return this.memberMessageService.sendMessageToAllMembers(createMemberMessageDto);
  }

  @ApiOperation({ summary: '获取消息详情' })
  @ApiResponse({ status: 200, description: '消息获取成功', type: MemberMessage })
  @Roles('admin', 'manager', 'member')
  @Get(':id')
  async getMessageById(@Param('id') id: string): Promise<MemberMessage> {
    return this.memberMessageService.getMessageById(id);
  }

  @ApiOperation({ summary: '更新消息状态' })
  @ApiResponse({ status: 200, description: '消息状态更新成功', type: MemberMessage })
  @Roles('admin', 'manager', 'member')
  @Put(':id/status')
  async updateMessageStatus(
    @Param('id') id: string,
    @Body() updateMemberMessageDto: UpdateMemberMessageDto
  ): Promise<MemberMessage> {
    return this.memberMessageService.updateMessageStatus(id, updateMemberMessageDto);
  }

  @ApiOperation({ summary: '标记所有消息为已读' })
  @ApiResponse({ status: 200, description: '消息标记成功', type: Number })
  @Roles('admin', 'manager', 'member')
  @Put('mark-all-read')
  async markAllAsRead(@Query('memberId') memberId: string): Promise<number> {
    return this.memberMessageService.markAllAsRead(memberId);
  }

  @ApiOperation({ summary: '删除消息' })
  @ApiResponse({ status: 200, description: '消息删除成功' })
  @Roles('admin', 'manager', 'member')
  @Delete(':id')
  async deleteMessage(@Param('id') id: string): Promise<void> {
    return this.memberMessageService.deleteMessage(id);
  }

  @ApiOperation({ summary: '删除所有消息' })
  @ApiResponse({ status: 200, description: '消息删除成功', type: Number })
  @Roles('admin', 'manager', 'member')
  @Delete()
  async deleteAll(@Query('memberId') memberId: string): Promise<number> {
    return this.memberMessageService.deleteAll(memberId);
  }

  @ApiOperation({ summary: '获取消息列表' })
  @ApiResponse({ status: 200, description: '消息列表获取成功' })
  @Roles('admin', 'manager', 'member')
  @Get()
  async getMessages(@Query() query: QueryMemberMessageDto): Promise<{ data: MemberMessage[]; total: number }> {
    return this.memberMessageService.getMessages(query);
  }

  @ApiOperation({ summary: '获取消息统计' })
  @ApiResponse({ status: 200, description: '消息统计获取成功' })
  @Roles('admin', 'manager', 'member')
  @Get('statistics')
  async getMessageStatistics(@Query('memberId') memberId: string): Promise<{ unreadCount: number; totalCount: number }> {
    return this.memberMessageService.getMessageStatistics(memberId);
  }

  @ApiOperation({ summary: '获取消息类型统计' })
  @ApiResponse({ status: 200, description: '消息类型统计获取成功' })
  @Roles('admin', 'manager', 'member')
  @Get('statistics/type')
  async getMessageCountByType(@Query('memberId') memberId: string): Promise<{ [key: string]: number }> {
    return this.memberMessageService.getMessageCountByType(memberId);
  }
}
