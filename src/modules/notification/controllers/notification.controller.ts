import { Controller, Post, Get, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import {
  Notification,
  NotificationStatus,
  NotificationType,
} from '../entities/notification.entity';

@ApiTags('通知管理')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: '创建通知' })
  @ApiBody({ type: CreateNotificationDto })
  async createNotification(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return await this.notificationService.createNotification(createNotificationDto);
  }

  @Post('broadcast')
  @ApiOperation({ summary: '创建系统广播通知' })
  @ApiBody({ type: CreateNotificationDto })
  async createBroadcastNotification(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<void> {
    return await this.notificationService.createBroadcastNotification(createNotificationDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新通知' })
  @ApiParam({ name: 'id', description: '通知ID' })
  @ApiBody({ type: UpdateNotificationDto })
  async updateNotification(
    @Param('id') id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    return await this.notificationService.updateNotification(id, updateNotificationDto);
  }

  @Put('read/:id')
  @ApiOperation({ summary: '标记通知为已读' })
  @ApiParam({ name: 'id', description: '通知ID' })
  async markAsRead(@Param('id') id: number): Promise<Notification> {
    return await this.notificationService.markAsRead(id);
  }

  @Put('read-all/:userId')
  @ApiOperation({ summary: '标记所有通知为已读' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  async markAllAsRead(@Param('userId') userId: string): Promise<void> {
    return await this.notificationService.markAllAsRead(userId);
  }

  @Put('delete/:id')
  @ApiOperation({ summary: '软删除通知' })
  @ApiParam({ name: 'id', description: '通知ID' })
  async softDeleteNotification(@Param('id') id: number): Promise<Notification> {
    return await this.notificationService.softDeleteNotification(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除通知' })
  @ApiParam({ name: 'id', description: '通知ID' })
  async deleteNotification(@Param('id') id: number): Promise<void> {
    return await this.notificationService.deleteNotification(id);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取通知详情' })
  @ApiParam({ name: 'id', description: '通知ID' })
  async findNotificationById(@Param('id') id: number): Promise<Notification> {
    return await this.notificationService.findNotificationById(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户通知列表' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiQuery({ name: 'type', description: '通知类型', enum: NotificationType, required: false })
  @ApiQuery({ name: 'status', description: '通知状态', enum: NotificationStatus, required: false })
  async findNotificationsByUserId(
    @Param('userId') userId: string,
    @Query('type') type?: NotificationType,
    @Query('status') status?: NotificationStatus,
  ): Promise<Notification[]> {
    return await this.notificationService.findNotificationsByUserId(userId, type, status);
  }

  @Get('unread/count/:userId')
  @ApiOperation({ summary: '统计用户未读通知数量' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  async countUnreadNotifications(@Param('userId') userId: string): Promise<number> {
    return await this.notificationService.countUnreadNotifications(userId);
  }

  @Get('system')
  @ApiOperation({ summary: '获取系统通知列表' })
  @ApiQuery({ name: 'type', description: '通知类型', enum: NotificationType, required: false })
  async findSystemNotifications(@Query('type') type?: NotificationType): Promise<Notification[]> {
    return await this.notificationService.findSystemNotifications(type);
  }
}
