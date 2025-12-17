import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessageController } from './controllers/message.controller';

@Module({
  imports: [ConfigModule],
  controllers: [MessageController],
  providers: [],
  exports: [],
})
export class ImModule {}