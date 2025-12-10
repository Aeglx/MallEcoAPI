import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LiveRoomService } from '../services/live-room.service';
import { CreateLiveRoomDto } from '../dto/create-live-room.dto';
import { LiveRoomSearchParams } from '../dto/live-room-search.dto';

@ApiTags('live-room')
@Controller('live/rooms')
export class LiveRoomController {
  constructor(private readonly liveRoomService: LiveRoomService) {}

  @Post()
  @ApiOperation({ summary: '创建直播间' })
  @ApiResponse({ status: 201, description: '直播间创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async createLiveRoom(@Body() createDto: CreateLiveRoomDto) {
    // TODO: 从token中获取用户ID
    const userId = 'user123';
    const storeId = createDto.storeId;
    return await this.liveRoomService.createLiveRoom(createDto, userId, storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取直播间详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  async getLiveRoom(@Param('id') id: string) {
    return await this.liveRoomService.getLiveRoomById(id);
  }

  @Get()
  @ApiOperation({ summary: '获取直播间列表' })
  @ApiQuery({ name: 'title', required: false, description: '直播间标题' })
  @ApiQuery({ name: 'status', required: false, description: '直播状态' })
  @ApiQuery({ name: 'type', required: false, description: '直播类型' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'size', required: false, description: '每页大小' })
  async getLiveRooms(@Query() searchParams: LiveRoomSearchParams) {
    return await this.liveRoomService.getLiveRooms(searchParams);
  }

  @Put(':id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '开始直播' })
  @ApiResponse({ status: 200, description: '直播开始成功' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  @ApiResponse({ status: 400, description: '直播间状态不允许开始' })
  async startLiveRoom(@Param('id') id: string) {
    // TODO: 从token中获取用户ID
    const userId = 'user123';
    return await this.liveRoomService.startLiveRoom(id, userId);
  }

  @Put(':id/end')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '结束直播' })
  @ApiResponse({ status: 200, description: '直播结束成功' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  @ApiResponse({ status: 400, description: '直播间未在直播中' })
  async endLiveRoom(@Param('id') id: string) {
    // TODO: 从token中获取用户ID
    const userId = 'user123';
    return await this.liveRoomService.endLiveRoom(id, userId);
  }

  @Put(':id/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '暂停直播' })
  @ApiResponse({ status: 200, description: '直播暂停成功' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  @ApiResponse({ status: 400, description: '直播间未在直播中' })
  async pauseLiveRoom(@Param('id') id: string) {
    // TODO: 从token中获取用户ID
    const userId = 'user123';
    return await this.liveRoomService.pauseLiveRoom(id, userId);
  }

  @Put(':id/viewers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新观看人数' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateViewerCount(@Param('id') id: string, @Body('viewerCount') viewerCount: number) {
    await this.liveRoomService.updateViewerCount(id, viewerCount);
    return { message: '观看人数更新成功' };
  }

  @Put(':id/stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新直播统计数据' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateLiveStats(@Param('id') id: string, @Body() stats: any) {
    await this.liveRoomService.updateLiveStats(id, stats);
    return { message: '统计数据更新成功' };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除直播间' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '直播间不存在' })
  @ApiResponse({ status: 400, description: '直播中的直播间无法删除' })
  async deleteLiveRoom(@Param('id') id: string) {
    // TODO: 从token中获取用户ID
    const userId = 'user123';
    await this.liveRoomService.deleteLiveRoom(id, userId);
    return { message: '直播间删除成功' };
  }

  @Get('user/my-rooms')
  @ApiOperation({ summary: '获取我的直播间列表' })
  async getMyLiveRooms(@Query() searchParams: LiveRoomSearchParams) {
    // TODO: 从token中获取用户ID
    const userId = 'user123';
    return await this.liveRoomService.getUserLiveRooms(userId, searchParams);
  }

  @Get('user/:userId/rooms')
  @ApiOperation({ summary: '获取指定用户的直播间列表' })
  async getUserLiveRooms(@Param('userId') userId: string, @Query() searchParams: LiveRoomSearchParams) {
    return await this.liveRoomService.getUserLiveRooms(userId, searchParams);
  }
}