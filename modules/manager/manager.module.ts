import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { LogModule } from './log/log.module';

@Module({
  imports: [ConfigModule, LogModule],
  controllers: [],
  providers: [],
  exports: [ConfigModule, LogModule],
})
export class ManagerModule {}
