import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MemberService } from '../services/member.service';
import { MemberEntity } from '../entities/member.entity';

@ApiTags('会员管理')
@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  @ApiOperation({ summary: '创建会员' })
  @ApiResponse({ status: 201, description: '会员创建成功', type: MemberEntity })
  async createMember(@Body() memberData: {
    username: string;
    password: string;
    nickname?: string;
    mobile?: string;
    email?: string;
    sex?: string;
    birthday?: string;
    avatar?: string;
    levelId?: string;
    experience?: number;
    status?: string;
    source?: string;
    inviteCode?: string;
    inviteMemberId?: string;
  }) {
    return await this.memberService.createMember(memberData);
  }

  @Get()
  @ApiOperation({ summary: '获取会员列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  @ApiQuery({ name: 'username', required: false, description: '用户名' })
  @ApiQuery({ name: 'mobile', required: false, description: '手机号' })
  @ApiQuery({ name: 'status', required: false, description: '状态' })
  @ApiQuery({ name: 'levelId', required: false, description: '会员等级' })
  async getMemberList(@Query() params: {
    page?: number;
    pageSize?: number;
    username?: string;
    mobile?: string;
    status?: string;
    levelId?: string;
  }) {
    return await this.memberService.getMemberList(params);
  }

  @Get(':memberId')
  @ApiOperation({ summary: '获取会员详情' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: MemberEntity })
  async getMemberById(@Param('memberId') memberId: string) {
    return await this.memberService.getMemberById(memberId);
  }

  @Put(':memberId')
  @ApiOperation({ summary: '更新会员信息' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: MemberEntity })
  async updateMember(
    @Param('memberId') memberId: string,
    @Body() updateData: Partial<MemberEntity>
  ) {
    return await this.memberService.updateMember(memberId, updateData);
  }

  @Delete(':memberId')
  @ApiOperation({ summary: '删除会员' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteMember(@Param('memberId') memberId: string) {
    return await this.memberService.deleteMember(memberId);
  }

  @Post(':memberId/status')
  @ApiOperation({ summary: '更新会员状态' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '状态更新成功' })
  async updateMemberStatus(
    @Param('memberId') memberId: string,
    @Body() data: { status: string; reason?: string }
  ) {
    return await this.memberService.updateMemberStatus(memberId, data.status, data.reason);
  }

  @Post(':memberId/level')
  @ApiOperation({ summary: '更新会员等级' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '等级更新成功' })
  async updateMemberLevel(
    @Param('memberId') memberId: string,
    @Body() data: { levelId: string; reason?: string }
  ) {
    return await this.memberService.updateMemberLevel(memberId, data.levelId, data.reason);
  }

  @Post(':memberId/experience')
  @ApiOperation({ summary: '增加会员经验值' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiResponse({ status: 200, description: '经验值增加成功' })
  async addMemberExperience(
    @Param('memberId') memberId: string,
    @Body() data: { experience: number; remark: string }
  ) {
    return await this.memberService.addMemberExperience(memberId, data.experience, data.remark);
  }

  @Get(':memberId/wallet')
  @ApiOperation({ summary: '获取会员钱包信息' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  async getMemberWallet(@Param('memberId') memberId: string) {
    return await this.memberService.getMemberWallet(memberId);
  }

  @Get(':memberId/orders')
  @ApiOperation({ summary: '获取会员订单列表' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量' })
  async getMemberOrders(
    @Param('memberId') memberId: string,
    @Query() params: { page?: number; pageSize?: number }
  ) {
    return await this.memberService.getMemberOrders(memberId, params);
  }

  @Get(':memberId/statistics')
  @ApiOperation({ summary: '获取会员统计信息' })
  @ApiParam({ name: 'memberId', description: '会员ID' })
  async getMemberStatistics(@Param('memberId') memberId: string) {
    return await this.memberService.getMemberStatistics(memberId);
  }

  @Post('register')
  @ApiOperation({ summary: '会员注册' })
  @ApiResponse({ status: 201, description: '注册成功', type: MemberEntity })
  async registerMember(@Body() registerData: {
    username: string;
    password: string;
    mobile: string;
    email?: string;
    inviteCode?: string;
    source?: string;
  }) {
    return await this.memberService.registerMember(registerData);
  }

  @Post('login')
  @ApiOperation({ summary: '会员登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  async loginMember(@Body() loginData: {
    username: string;
    password: string;
    loginType?: string;
  }) {
    return await this.memberService.loginMember(loginData);
  }

  @Post('logout')
  @ApiOperation({ summary: '会员登出' })
  @ApiResponse({ status: 200, description: '登出成功' })
  async logoutMember(@Request() req) {
    const memberId = req.user?.sub;
    return await this.memberService.logoutMember(memberId);
  }

  @Post('password/reset')
  @ApiOperation({ summary: '重置密码' })
  @ApiResponse({ status: 200, description: '密码重置成功' })
  async resetPassword(@Body() resetData: {
    mobile: string;
    newPassword: string;
    smsCode: string;
  }) {
    return await this.memberService.resetPassword(resetData);
  }

  @Post('password/change')
  @ApiOperation({ summary: '修改密码' })
  @ApiResponse({ status: 200, description: '密码修改成功' })
  async changePassword(
    @Request() req,
    @Body() changeData: {
      oldPassword: string;
      newPassword: string;
    }
  ) {
    const memberId = req.user?.sub;
    return await this.memberService.changePassword(memberId, changeData);
  }
}