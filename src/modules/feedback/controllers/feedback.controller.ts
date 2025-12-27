import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { FeedbackService } from '../services/feedback.service';
import { CreateFeedbackDto } from '../dto/create-feedback.dto';
import { Feedback } from '../entities/feedback.entity';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../infrastructure/auth/guards/roles.guard';
import { Roles } from '../../../infrastructure/auth/decorators/roles.decorator';
import { Role } from '../../users/enums/role.enum';

@ApiTags('反馈管理')
@Controller('api/feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: '创建反馈' })
  @ApiResponse({ status: 201, description: '反馈创建成功', type: Feedback })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async createFeedback(@Body() createFeedbackDto: CreateFeedbackDto): Promise<Feedback> {
    return this.feedbackService.createFeedback(createFeedbackDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取反馈详情' })
  @ApiParam({ name: 'id', description: '反馈ID', type: Number })
  @ApiResponse({ status: 200, description: '获取反馈详情成功', type: Feedback })
  @ApiResponse({ status: 404, description: '反馈记录不存在' })
  async getFeedbackById(@Param('id') id: number): Promise<Feedback> {
    return this.feedbackService.getFeedbackById(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '根据用户ID获取反馈列表' })
  @ApiParam({ name: 'userId', description: '用户ID', type: Number })
  @ApiResponse({ status: 200, description: '获取用户反馈列表成功', type: [Feedback] })
  async getFeedbacksByUserId(@Param('userId') userId: number): Promise<Feedback[]> {
    return this.feedbackService.getFeedbacksByUserId(userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '获取所有反馈列表（管理员）' })
  @ApiQuery({ name: 'page', description: '页码', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', description: '每页数量', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: '获取反馈列表成功', type: [Feedback] })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '禁止访问' })
  async getAllFeedbacks(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.feedbackService.getAllFeedbacks(page, limit);
  }

  @Put(':id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '回复反馈（管理员）' })
  @ApiParam({ name: 'id', description: '反馈ID', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reply: { type: 'string', description: '回复内容' },
        adminId: { type: 'number', description: '管理员ID' },
      },
    },
  })
  @ApiResponse({ status: 200, description: '回复反馈成功', type: Feedback })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '禁止访问' })
  @ApiResponse({ status: 404, description: '反馈记录不存在' })
  async replyFeedback(
    @Param('id') id: number,
    @Body() { reply, adminId }: { reply: string; adminId: number },
  ): Promise<Feedback> {
    return this.feedbackService.replyFeedback(id, reply, adminId);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '更新反馈状态（管理员）' })
  @ApiParam({ name: 'id', description: '反馈ID', type: Number })
  @ApiBody({
    schema: { type: 'object', properties: { status: { type: 'string', description: '反馈状态' } } },
  })
  @ApiResponse({ status: 200, description: '更新反馈状态成功', type: Feedback })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '禁止访问' })
  @ApiResponse({ status: 404, description: '反馈记录不存在' })
  async updateFeedbackStatus(
    @Param('id') id: number,
    @Body() { status }: { status: string },
  ): Promise<Feedback> {
    return this.feedbackService.updateFeedbackStatus(id, status as any);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '删除反馈（管理员）' })
  @ApiParam({ name: 'id', description: '反馈ID', type: Number })
  @ApiResponse({ status: 200, description: '删除反馈成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '禁止访问' })
  @ApiResponse({ status: 404, description: '反馈记录不存在' })
  async deleteFeedback(@Param('id') id: number): Promise<void> {
    return this.feedbackService.deleteFeedback(id);
  }
}
