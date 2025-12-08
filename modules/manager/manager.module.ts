import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { LogModule } from './log/log.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [ConfigModule, LogModule, MessagesModule],
  controllers: [],
  providers: [],
  exports: [ConfigModule, LogModule, MessagesModule],
})
export class ManagerModule {}
