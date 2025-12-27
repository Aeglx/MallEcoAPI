import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { LiveService } from './live.service';
import { LiveRoom } from './entities/live-room.entity';
import { LiveStatistics } from './entities/live-statistics.entity';
import { CreateLiveRoomDto } from './dto/create-live-room.dto';
import { UpdateLiveRoomDto } from './dto/update-live-room.dto';

@ApiTags('直播管理')
@Controller('live')
export class LiveController {
  constructor(private readonly liveService: LiveService) {}

  @Post()
  @ApiOperation({ summary: '创建直播间' })
  @ApiBody({ type: CreateLiveRoomDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: '创建成功', type: LiveRoom })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '参数错误' })
  async createLiveRoom(@Body() createLiveRoomDto: CreateLiveRoomDto): Promise<LiveRoom> {
    return this.liveService.createLiveRoom(createLiveRoomDto);
  }

  @Get()
  @ApiOperation({ summary: '获取直播间列表' })
  @ApiQuery({ name: 'page', description: '页码', example: 1, required: false, type: Number })
  @ApiQuery({
    name: 'pageSize',
    description: '每页数量',
    example: 10,
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'status',
    description: '状态：0-未开播，1-直播中，2-已结束',
    example: 1,
    required: false,
    type: Number,
  })
  @ApiResponse({ status: HttpStatus.OK, description: '查询成功' })
  async getLiveRooms(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('status') status?: number,
  ): Promise<{ success: boolean; data: { items: LiveRoom[]; total: number }; message: string }> {
    const result = await this.liveService.getLiveRooms(page, pageSize, status);
    return {
      success: true,
      data: result,
      message: '获取直播间列表成功',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取直播间详情' })
  @ApiParam({ name: 'id', description: '直播间ID', example: '1' })
  @ApiResponse({ status: HttpStatus.OK, description: '查询成功', type: LiveRoom })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '直播间不存在' })
  async getLiveRoomById(
    @Param('id') id: string,
  ): Promise<{ success: boolean; data: LiveRoom; message: string }> {
    const liveRoom = await this.liveService.getLiveRoomById(id);
    return {
      success: true,
      data: liveRoom,
      message: '获取直播间详情成功',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '更新直播间' })
  @ApiParam({ name: 'id', description: '直播间ID', example: '1' })
  @ApiBody({ type: UpdateLiveRoomDto })
  @ApiResponse({ status: HttpStatus.OK, description: '更新成功', type: LiveRoom })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '直播间不存在' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '参数错误' })
  async updateLiveRoom(
    @Param('id') id: string,
    @Body() updateLiveRoomDto: UpdateLiveRoomDto,
  ): Promise<{ success: boolean; data: LiveRoom; message: string }> {
    const updatedRoom = await this.liveService.updateLiveRoom(id, updateLiveRoomDto);
    return {
      success: true,
      data: updatedRoom,
      message: '更新直播间成功',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除直播间' })
  @ApiParam({ name: 'id', description: '直播间ID', example: '1' })
  @ApiResponse({ status: HttpStatus.OK, description: '删除成功' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '直播间不存在' })
  async deleteLiveRoom(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    await this.liveService.deleteLiveRoom(id);
    return {
      success: true,
      message: '删除直播间成功',
    };
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: '获取直播间统计数据' })
  @ApiParam({ name: 'id', description: '直播间ID', example: '1' })
  @ApiResponse({ status: HttpStatus.OK, description: '查询成功', type: [LiveStatistics] })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '直播间不存在' })
  async getLiveStatistics(
    @Param('id') id: string,
  ): Promise<{ success: boolean; data: LiveStatistics[]; message: string }> {
    const statistics = await this.liveService.getLiveStatistics(id);
    return {
      success: true,
      data: statistics,
      message: '获取直播间统计数据成功',
    };
  }
}
