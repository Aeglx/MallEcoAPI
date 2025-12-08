import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberMessage } from './entities/member-message.entity';
import { StoreMessage } from './entities/store-message.entity';
import { MemberMessageService } from './services/member-message.service';
import { StoreMessageService } from './services/store-message.service';
import { MemberMessageController } from './controllers/member-message.controller';
import { StoreMessageController } from './controllers/store-message.controller';
import { RabbitMQModule } from '../../src/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberMessage, StoreMessage]),
    forwardRef(() => RabbitMQModule)
  ],
  controllers: [MemberMessageController, StoreMessageController],
  providers: [MemberMessageService, StoreMessageService],
  exports: [MemberMessageService, StoreMessageService]
})
export class MessageModule {}
