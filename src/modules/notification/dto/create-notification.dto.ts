import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../entities/notification.entity';


export class CreateNotificationDto {
  @ApiProperty({ description: '用户ID', required: false, example: '1' })
  userId?: string;

  @ApiProperty({ description: '通知类型', enum: NotificationType, example: NotificationType.SYSTEM })
  type: NotificationType;

  @ApiProperty({ description: '通知标题', example: '系统通知' })
  title: string;

  @ApiProperty({ description: '通知内容', example: '这是一条系统通知' })
  content: string;

  @ApiProperty({ description: '通知链接', required: false, example: '/system/notice/123' })
  link?: string;

  @ApiProperty({ description: '是否推送', required: false, example: 1 })
  isPush?: number;

  @ApiProperty({ description: '是否发送短信', required: false, example: 0 })
  isSms?: number;

  @ApiProperty({ description: '是否发送邮件', required: false, example: 0 })
  isEmail?: number;
}
