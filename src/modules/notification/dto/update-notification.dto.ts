import { ApiProperty } from '@nestjs/swagger';
import { NotificationStatus } from '../entities/notification.entity';


export class UpdateNotificationDto {
  @ApiProperty({ description: '通知状态', enum: NotificationStatus, required: false })
  status?: NotificationStatus;

  @ApiProperty({ description: '是否推送', required: false, example: 1 })
  isPush?: number;

  @ApiProperty({ description: '是否发送短信', required: false, example: 0 })
  isSms?: number;

  @ApiProperty({ description: '是否发送邮件', required: false, example: 0 })
  isEmail?: number;
}
