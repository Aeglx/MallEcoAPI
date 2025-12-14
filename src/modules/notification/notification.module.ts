import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './services/notification.service';
import { UsersModule } from '../users/users.module';
import { SmsModule } from '../sms/sms.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    UsersModule,
    SmsModule,
    MailModule
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService]
})
export class NotificationModule {}
