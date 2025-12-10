import { Controller, Post, Delete, Get, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LiveFollowService } from '../services/live-follow.service';

@ApiTags('live-follow')
@Controller('live/follow')
export class LiveFollowController {
  constructor(private readonly liveFollowService: LiveFollowService) {}

  @Post('room/:roomId')
  @ApiOperation({ summary: '关注直播间' })
  @ApiResponse({ status: 201, description: '关注成功' })
  @ApiResponse({ status: 400, description: '已经关注该直播间' })
  async followRoom(@Param('roomId') roomId: string) {
    // TODO: 从token中获取用户ID
    const userId = 'user123';
    return await this.liveFollowService.followRoom(roomId, userId);
  }

  @Delete('room/:roomId')
  @ApiOperation({ summary: '取消关注直播间' })
  @ApiResponse({ status: 200, description: '取消关注成功' })
  @ApiResponse({ status: 400, description: '未关注该直播间' })
  async unfollowRoom(@Param('roomId') roomId: string) {
    // TODO: 从token中获取用户ID
    const userId = 'user123';
    await this.liveFollowService.unfollowRoom(roomId, userId);
    return { message: '取消关注成功' };
  }

  @Get('user/my-follows')
  @ApiOperation({ summary: '获取我关注的直播间列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'size', required: false, description: '每页大小' })
  async getMyFollowedRooms(
    @Query('page') page: number = 1,
    @Query('size') size: number = 20
  ) {
    // TODO: 从token中获取用户ID
    const userId = 'user123';
    return await this.liveFollowService.getUserFollowedRooms(userId, page, size);
  }

  @Get('room/:roomId/followers')
  @ApiOperation({ summary: '获取直播间粉丝列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'size', required: false, description: '每页大小' })
  async getRoomFollowers(
    @Param('roomId') roomId: string,
    @Query('page') page: number = 1,
    @Query('size') size: number = 20
  ) {
    return await this.liveFollowService.getRoomFollowers(roomId, page, size);
  }

  @Get('room/:roomId/is-following')
  @ApiOperation({ summary: '检查是否关注直播间' })
  async isFollowingRoom(@Param('roomId') roomId: string) {
    // TODO: 从token中获取用户ID
    const userId = 'user123';
    const isFollowing = await this.liveFollowService.isUserFollowingRoom(roomId, userId);
    return { isFollowing };
  }

  @Get('room/:roomId/follower-count')
  @ApiOperation({ summary: '获取直播间粉丝数量' })
  async getRoomFollowerCount(@Param('roomId') roomId: string) {
    const count = await this.liveFollowService.getRoomFollowerCount(roomId);
    return { followerCount: count };
  }

  @Get('user/follow-count')
  @ApiOperation({ summary: '获取用户关注数量' })
  async getUserFollowCount() {
    // TODO: 从token中获取用户ID
    const userId = 'user123';
    const count = await this.liveFollowService.getUserFollowCount(userId);
    return { followCount: count };
  }
}