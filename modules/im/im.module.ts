import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { ImTalk } from './entities/im-talk.entity';
import { ChatRoomService } from './services/chat-room.service';
import { ChatMessageService } from './services/chat-message.service';
import { ImTalkService } from './services/im-talk.service';
import { ChatRoomController } from './controllers/chat-room.controller';
import { ChatMessageController } from './controllers/chat-message.controller';
import { ImTalkController } from './controllers/im-talk.controller';
import { RabbitMQModule } from '../../src/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom, ChatMessage, ImTalk]),
    RabbitMQModule
  ],
  controllers: [ChatRoomController, ChatMessageController, ImTalkController],
  providers: [ChatRoomService, ChatMessageService, ImTalkService],
  exports: [ChatRoomService, ChatMessageService, ImTalkService]
})
export class ImModule {}
