import { Controller, Post, Get, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LiveReplayService } from '../services/live-replay.service';

@ApiTags('live-replay')
@Controller('live/replays')
export class LiveReplayController {
  constructor(private readonly liveReplayService: LiveReplayService) {}

  @Post('room/:roomId')
  @ApiOperation({ summary: '创建直播回放' })
  @ApiResponse({ status: 201, description: '回放创建成功' })
  async createReplay(
    @Param('roomId') roomId: string,
    @Body() replayData: any
  ) {
    return await this.liveReplayService.createReplay(roomId, replayData);
  }

  @Get('room/:roomId')
  @ApiOperation({ summary: '获取直播回放列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'size', required: false, description: '每页大小' })
  async getReplays(
    @Param('roomId') roomId: string,
    @Query('page') page: number = 1,
    @Query('size') size: number = 20
  ) {
    return await this.liveReplayService.getReplays(roomId, page, size);
  }

  @Get(':replayId')
  @ApiOperation({ summary: '获取回放详情' })
  async getReplayDetail(@Param('replayId') replayId: string) {
    return await this.liveReplayService.getReplayDetail(replayId);
  }

  @Delete(':replayId')
  @ApiOperation({ summary: '删除回放' })
  @ApiResponse({ status: 200, description: '回放删除成功' })
  async deleteReplay(@Param('replayId') replayId: string) {
    await this.liveReplayService.deleteReplay(replayId);
    return { message: '回放删除成功' };
  }

  @Put(':replayId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新回放状态' })
  async updateReplayStatus(
    @Param('replayId') replayId: string,
    @Body('status') status: string,
    @Body('replayUrl') replayUrl?: string
  ) {
    await this.liveReplayService.updateReplayStatus(replayId, status, replayUrl);
    return { message: '回放状态更新成功' };
  }

  @Get('hot')
  @ApiOperation({ summary: '获取热门回放列表' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量限制' })
  async getHotReplays(@Query('limit') limit: number = 10) {
    return await this.liveReplayService.getHotReplays(limit);
  }

  @Put(':replayId/view-count')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '增加回放观看次数' })
  async increaseViewCount(@Param('replayId') replayId: string) {
    await this.liveReplayService.increaseViewCount(replayId);
    return { message: '观看次数增加成功' };
  }

  @Get('search')
  @ApiOperation({ summary: '搜索回放' })
  @ApiQuery({ name: 'keyword', required: true, description: '搜索关键词' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'size', required: false, description: '每页大小' })
  async searchReplays(
    @Query('keyword') keyword: string,
    @Query('page') page: number = 1,
    @Query('size') size: number = 20
  ) {
    return await this.liveReplayService.searchReplays(keyword, page, size);
  }
}