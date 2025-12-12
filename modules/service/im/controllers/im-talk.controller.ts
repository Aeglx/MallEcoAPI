import { Controller, Get, Post, Delete, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ImTalkService } from '../services/im-talk.service';
import { ImTalkQueryParams, TopTalkDto } from '../dto/im-talk.dto';

@ApiTags('即时通讯 - 聊天会话')
@Controller('im/talk')
export class ImTalkController {
  constructor(private readonly imTalkService: ImTalkService) {}

  @ApiOperation({ summary: '查看聊天会话详情' })
  @ApiParam({ name: 'id', description: '聊天会话ID', required: true })
  @Get(':id')
  async getTalkById(@Param('id') id: string) {
    return await this.imTalkService.getTalkById(id);
  }

  @ApiOperation({ summary: '查看与某人的聊天会话' })
  @ApiParam({ name: 'userId1', description: '当前用户ID', required: true })
  @ApiParam({ name: 'userId2', description: '对方用户ID', required: true })
  @Get('user/:userId1/:userId2')
  async getTalkByUser(@Param('userId1') userId1: string, @Param('userId2') userId2: string) {
    return await this.imTalkService.getTalkByUser(userId1, userId2);
  }

  @ApiOperation({ summary: '创建或获取与某人的聊天会话' })
  @ApiParam({ name: 'userId1', description: '当前用户ID', required: true })
  @ApiParam({ name: 'userId2', description: '对方用户ID', required: true })
  @Post('create/:userId1/:userId2')
  async createOrGetTalk(@Param('userId1') userId1: string, @Param('userId2') userId2: string) {
    return await this.imTalkService.createOrGetTalk(userId1, userId2);
  }

  @ApiOperation({ summary: '设置聊天会话置顶' })
  @ApiParam({ name: 'id', description: '聊天会话ID', required: true })
  @ApiParam({ name: 'userId', description: '当前用户ID', required: true })
  @ApiBody({ type: TopTalkDto })
  @Post('top/:id/:userId')
  async topTalk(@Param('id') id: string, @Param('userId') userId: string, @Body() topTalkDto: TopTalkDto) {
    await this.imTalkService.topTalk(id, topTalkDto.top, userId);
    return { message: '设置成功' };
  }

  @ApiOperation({ summary: '禁用聊天会话' })
  @ApiParam({ name: 'id', description: '聊天会话ID', required: true })
  @ApiParam({ name: 'userId', description: '当前用户ID', required: true })
  @Delete('disable/:id/:userId')
  async disableTalk(@Param('id') id: string, @Param('userId') userId: string) {
    await this.imTalkService.disableTalk(id, userId);
    return { message: '禁用成功' };
  }

  @ApiOperation({ summary: '获取用户聊天会话列表' })
  @ApiParam({ name: 'userId', description: '用户ID', required: true })
  @ApiQuery({ type: ImTalkQueryParams })
  @Get('list/:userId')
  async getUserTalkList(@Param('userId') userId: string, @Query() query: ImTalkQueryParams) {
    return await this.imTalkService.getUserTalkList(userId, query);
  }

  @ApiOperation({ summary: '获取商家聊天会话列表' })
  @ApiParam({ name: 'storeId', description: '店铺ID', required: true })
  @ApiQuery({ type: ImTalkQueryParams })
  @Get('store/list/:storeId')
  async getStoreTalkList(@Param('storeId') storeId: string, @Query() query: ImTalkQueryParams) {
    return await this.imTalkService.getStoreTalkList(storeId, query);
  }
}