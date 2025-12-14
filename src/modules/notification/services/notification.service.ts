import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Notification, NotificationStatus, NotificationType } from '../entities/notification.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { UserService } from '../../user/services/user.service';
import { SmsService } from '../../sms/services/sms.service';
import { MailService } from '../../mail/services/mail.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
    private readonly userService: UserService,
    private readonly smsService: SmsService,
    private readonly mailService: MailService
  ) {}

  /**
   * 创建通知
   * @param createNotificationDto 创建通知DTO
   */
  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    const savedNotification = await this.notificationRepository.save(notification);

    // 如果需要发送短信通知
    if (savedNotification.isSms === 1 && savedNotification.userId) {
      const user = await this.userService.findUserById(savedNotification.userId);
      if (user && user.phone) {
        await this.smsService.sendSms(
          user.phone,
          `【MallEco】${savedNotification.title}: ${savedNotification.content}`
        );
      }
    }

    // 如果需要发送邮件通知
    if (savedNotification.isEmail === 1 && savedNotification.userId) {
      const user = await this.userService.findUserById(savedNotification.userId);
      if (user && user.email) {
        await this.mailService.sendMail(
          user.email,
          savedNotification.title,
          savedNotification.content
        );
      }
    }

    return savedNotification;
  }

  /**
   * 创建系统广播通知（所有用户）
   * @param createNotificationDto 创建通知DTO
   */
  async createBroadcastNotification(createNotificationDto: CreateNotificationDto): Promise<void> {
    // 获取所有用户ID
    const users = await this.userService.findAllUsers();
    const userIds = users.map(user => user.id);

    // 为每个用户创建通知
    for (const userId of userIds) {
      await this.createNotification({
        ...createNotificationDto,
        userId
      });
    }
  }

  /**
   * 更新通知状态
   * @param id 通知ID
   * @param updateNotificationDto 更新通知DTO
   */
  async updateNotification(id: number, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findNotificationById(id);
    Object.assign(notification, updateNotificationDto);
    return await this.notificationRepository.save(notification);
  }

  /**
   * 标记通知为已读
   * @param id 通知ID
   */
  async markAsRead(id: number): Promise<Notification> {
    return await this.updateNotification(id, { status: NotificationStatus.READ });
  }

  /**
   * 标记所有通知为已读
   * @param userId 用户ID
   */
  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { userId, status: NotificationStatus.UNREAD },
      { status: NotificationStatus.READ }
    );
  }

  /**
   * 删除通知
   * @param id 通知ID
   */
  async deleteNotification(id: number): Promise<void> {
    const result = await this.notificationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('通知不存在');
    }
  }

  /**
   * 软删除通知
   * @param id 通知ID
   */
  async softDeleteNotification(id: number): Promise<Notification> {
    return await this.updateNotification(id, { status: NotificationStatus.DELETED });
  }

  /**
   * 获取通知详情
   * @param id 通知ID
   */
  async findNotificationById(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOneBy({ id });
    if (!notification) {
      throw new NotFoundException('通知不存在');
    }
    return notification;
  }

  /**
   * 获取用户通知列表
   * @param userId 用户ID
   * @param type 通知类型
   * @param status 通知状态
   */
  async findNotificationsByUserId(
    userId: number,
    type?: NotificationType,
    status?: NotificationStatus
  ): Promise<Notification[]> {
    const where: any = { userId };
    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    } else {
      where.status = Not(NotificationStatus.DELETED);
    }

    return await this.notificationRepository.find({
      where,
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * 统计用户未读通知数量
   * @param userId 用户ID
   */
  async countUnreadNotifications(userId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, status: NotificationStatus.UNREAD }
    });
  }

  /**
   * 获取系统通知列表（管理员）
   * @param type 通知类型
   */
  async findSystemNotifications(type?: NotificationType): Promise<Notification[]> {
    const where: any = {};
    if (type) {
      where.type = type;
    }

    return await this.notificationRepository.find({
      where,
      order: { createdAt: 'DESC' }
    });
  }
}
