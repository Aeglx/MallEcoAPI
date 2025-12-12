import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req, Query } from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('会员管理')
@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  /**
   * 会员注册
   * @param createMemberDto 创建会员DTO
   * @returns 创建的会员
   */
  @Post('register')
  @ApiOperation({ summary: '会员注册' })
  @ApiBody({ type: CreateMemberDto })
  @ApiResponse({ status: 201, description: '会员注册成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async register(@Body() createMemberDto: CreateMemberDto) {
    return await this.memberService.create(createMemberDto);
  }

  /**
   * 会员登录
   * @param req 请求对象
   * @param body 请求体
   * @returns 登录成功的会员
   */
  @Post('login')
  @ApiOperation({ summary: '会员登录' })
  @ApiBody({ schema: { type: 'object', properties: { account: { type: 'string', description: '账号/手机/邮箱' }, password: { type: 'string', description: '密码' } } } })
  @ApiResponse({ status: 200, description: '会员登录成功' })
  @ApiResponse({ status: 401, description: '账号或密码错误' })
  async login(@Req() req, @Body() body: { account: string; password: string }) {
    // 获取客户端IP
    const ip = req.ip || req.connection.remoteAddress;
    return await this.memberService.login(body.account, body.password, ip);
  }

  /**
   * 查询会员列表
   * @returns 会员列表
   */
  @Get()
  @ApiOperation({ summary: '查询会员列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @UseGuards(AuthGuard('jwt'))
  async findAll() {
    return await this.memberService.findAll();
  }

  /**
   * 根据ID查询会员
   * @param id 会员ID
   * @returns 会员
   */
  @Get(':id')
  @ApiOperation({ summary: '根据ID查询会员' })
  @ApiParam({ name: 'id', description: '会员ID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '会员不存在' })
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string) {
    return await this.memberService.findOne(id);
  }

  /**
   * 更新会员信息
   * @param id 会员ID
   * @param updateMemberDto 更新会员DTO
   * @returns 更新后的会员
   */
  @Put(':id')
  @ApiOperation({ summary: '更新会员信息' })
  @ApiParam({ name: 'id', description: '会员ID' })
  @ApiBody({ type: UpdateMemberDto })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '会员不存在' })
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return await this.memberService.update(id, updateMemberDto);
  }

  /**
   * 删除会员
   * @param id 会员ID
   * @returns 删除结果
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除会员' })
  @ApiParam({ name: 'id', description: '会员ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '会员不存在' })
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string) {
    await this.memberService.remove(id);
    return { message: 'Member deleted successfully' };
  }

  /**
   * 重置会员密码
   * @param body 请求体
   * @returns 重置密码后的会员
   */
  @Post('reset-password')
  @ApiOperation({ summary: '重置会员密码' })
  @ApiBody({ schema: { type: 'object', properties: { account: { type: 'string', description: '账号/手机/邮箱' }, newPassword: { type: 'string', description: '新密码' } } } })
  @ApiResponse({ status: 200, description: '密码重置成功' })
  @ApiResponse({ status: 404, description: '会员不存在' })
  @UseGuards(AuthGuard('jwt'))
  async resetPassword(@Body() body: { account: string; newPassword: string }) {
    return await this.memberService.resetPassword(body.account, body.newPassword);
  }

  /**
   * 冻结会员
   * @param id 会员ID
   * @returns 冻结后的会员
   */
  @Post(':id/freeze')
  @ApiOperation({ summary: '冻结会员' })
  @ApiParam({ name: 'id', description: '会员ID' })
  @ApiResponse({ status: 200, description: '会员冻结成功' })
  @ApiResponse({ status: 404, description: '会员不存在' })
  @UseGuards(AuthGuard('jwt'))
  async freeze(@Param('id') id: string) {
    return await this.memberService.freeze(id);
  }

  /**
   * 解冻会员
   * @param id 会员ID
   * @returns 解冻后的会员
   */
  @Post(':id/unfreeze')
  @ApiOperation({ summary: '解冻会员' })
  @ApiParam({ name: 'id', description: '会员ID' })
  @ApiResponse({ status: 200, description: '会员解冻成功' })
  @ApiResponse({ status: 404, description: '会员不存在' })
  @UseGuards(AuthGuard('jwt'))
  async unfreeze(@Param('id') id: string) {
    return await this.memberService.unfreeze(id);
  }
}
