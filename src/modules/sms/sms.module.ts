import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsController } from './controllers/sms.controller';
import { SmsService } from './services/sms.service';
import { AliyunSmsService } from './services/aliyun-sms.service';
import { SmsLog } from './entities/sms-log.entity';
import { SmsTemplate } from './entities/sms-template.entity';
import { SmsVerification } from './entities/sms-verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SmsLog, SmsTemplate, SmsVerification])],
  controllers: [SmsController],
  providers: [SmsService, AliyunSmsService],
  exports: [SmsService],
})
export class SmsModule {}
