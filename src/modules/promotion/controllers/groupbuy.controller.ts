import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { GroupBuyService } from '../services/groupbuy.service';
import { GroupBuyEntity } from '../entities/groupbuy.entity';

@ApiTags('拼团活动')
@Controller('promotion/groupbuy')
export class GroupBuyController {
  constructor(private readonly groupBuyService: GroupBuyService) {}

  @Post()
  @ApiOperation({ summary: '创建拼团活动' })
  @ApiResponse({ status: 201, description: '拼团活动创建成功', type: GroupBuyEntity })
  async createGroupBuy(@Body() data: {
    groupName: string;
    startTime: string;
    endTime: string;
    groupPrice: number;
    originalPrice: number;
    minMembers: number;
    maxMembers: number;
    durationHours: number;
    stock: number;
    goodsId: string;
    storeId: string;
    images?: string[];
    description?: string;
    isActive?: boolean;
  }) {
    return await this.groupBuyService.createGroupBuy(data);
  }

  @Get()
  @ApiOperation({ summary: '获取拼团活动列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'status', required: false, description: '活动状态' })
  @ApiQuery({ name: 'storeId', required: false, description: '店铺ID' })
  async getGroupBuyList(@Query() params: {
    page?: number;
    pageSize?: number;
    status?: string;
    storeId?: string;
  }) {
    return await this.groupBuyService.getGroupBuyList(params);
  }

  @Get(':groupId')
  @ApiOperation({ summary: '获取拼团活动详情' })
  @ApiParam({ name: 'groupId', description: '拼团活动ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: GroupBuyEntity })
  async getGroupBuyById(@Param('groupId') groupId: string) {
    return await this.groupBuyService.getGroupBuyById(groupId);
  }

  @Put(':groupId')
  @ApiOperation({ summary: '更新拼团活动' })
  @ApiParam({ name: 'groupId', description: '拼团活动ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: GroupBuyEntity })
  async updateGroupBuy(
    @Param('groupId') groupId: string,
    @Body() updateData: Partial<GroupBuyEntity>
  ) {
    return await this.groupBuyService.updateGroupBuy(groupId, updateData);
  }

  @Delete(':groupId')
  @ApiOperation({ summary: '删除拼团活动' })
  @ApiParam({ name: 'groupId', description: '拼团活动ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteGroupBuy(@Param('groupId') groupId: string) {
    return await this.groupBuyService.deleteGroupBuy(groupId);
  }

  @Post(':groupId/start')
  @ApiOperation({ summary: '开始拼团活动' })
  @ApiParam({ name: 'groupId', description: '拼团活动ID' })
  @ApiResponse({ status: 200, description: '活动开始成功' })
  async startGroupBuy(@Param('groupId') groupId: string) {
    return await this.groupBuyService.startGroupBuy(groupId);
  }

  @Post(':groupId/end')
  @ApiOperation({ summary: '结束拼团活动' })
  @ApiParam({ name: 'groupId', description: '拼团活动ID' })
  @ApiResponse({ status: 200, description: '活动结束成功' })
  async endGroupBuy(@Param('groupId') groupId: string) {
    return await this.groupBuyService.endGroupBuy(groupId);
  }

  @Post('team/create')
  @ApiOperation({ summary: '创建拼团' })
  @ApiResponse({ status: 201, description: '拼团创建成功' })
  async createGroupTeam(@Body() data: {
    groupId: string;
    leaderId: string;
    quantity: number;
    addressId: string;
  }) {
    return await this.groupBuyService.createGroupTeam(data);
  }

  @Post('team/:teamId/join')
  @ApiOperation({ summary: '加入拼团' })
  @ApiParam({ name: 'teamId', description: '拼团ID' })
  @ApiResponse({ status: 200, description: '加入拼团成功' })
  async joinGroupTeam(
    @Param('teamId') teamId: string,
    @Body() data: {
      memberId: string;
      quantity: number;
      addressId: string;
    }
  ) {
    return await this.groupBuyService.joinGroupTeam(teamId, data);
  }

  @Get('teams/:groupId')
  @ApiOperation({ summary: '获取拼团活动下的团队列表' })
  @ApiParam({ name: 'groupId', description: '拼团活动ID' })
  @ApiQuery({ name: 'status', required: false, description: '团队状态' })
  async getGroupTeams(
    @Param('groupId') groupId: string,
    @Query('status') status?: string
  ) {
    return await this.groupBuyService.getGroupTeams(groupId, status);
  }

  @Get('team/:teamId')
  @ApiOperation({ summary: '获取拼团详情' })
  @ApiParam({ name: 'teamId', description: '拼团ID' })
  async getGroupTeamDetail(@Param('teamId') teamId: string) {
    return await this.groupBuyService.getGroupTeamDetail(teamId);
  }

  @Post('team/:teamId/success')
  @ApiOperation({ summary: '拼团成功' })
  @ApiParam({ name: 'teamId', description: '拼团ID' })
  @ApiResponse({ status: 200, description: '拼团成功' })
  async groupTeamSuccess(@Param('teamId') teamId: string) {
    return await this.groupBuyService.groupTeamSuccess(teamId);
  }

  @Post('team/:teamId/fail')
  @ApiOperation({ summary: '拼团失败' })
  @ApiParam({ name: 'teamId', description: '拼团ID' })
  @ApiResponse({ status: 200, description: '拼团失败' })
  async groupTeamFail(@Param('teamId') teamId: string) {
    return await this.groupBuyService.groupTeamFail(teamId);
  }

  @Get('member/:memberId/records')
  @ApiOperation({ summary: '获取会员拼团记录' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  async getMemberGroupBuyRecords(
    @Param('memberId') memberId: string,
    @Query() params: { page?: number; pageSize?: number }
  ) {
    return await this.groupBuyService.getMemberGroupBuyRecords(memberId, params);
  }

  @Get('statistics/:groupId')
  @ApiOperation({ summary: '获取拼团活动统计' })
  @ApiParam({ name: 'groupId', description: '拼团活动ID' })
  async getGroupBuyStatistics(@Param('groupId') groupId: string) {
    return await this.groupBuyService.getGroupBuyStatistics(groupId);
  }

  @Get('recommend')
  @ApiOperation({ summary: '获取推荐拼团活动' })
  @ApiQuery({ name: 'limit', required: false, description: '数量限制' })
  async getRecommendGroupBuys(@Query('limit') limit?: number) {
    return await this.groupBuyService.getRecommendGroupBuys(limit || 10);
  }
}