import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailController } from './controllers/email.controller';
import { EmailService } from './services/email.service';
import { SmtpEmailService } from './services/smtp-email.service';
import { EmailLog } from './entities/email-log.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { EmailVerification } from './entities/email-verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailLog, EmailTemplate, EmailVerification])],
  controllers: [EmailController],
  providers: [EmailService, SmtpEmailService],
  exports: [EmailService],
})
export class EmailModule {}
