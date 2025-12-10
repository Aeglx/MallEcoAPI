import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveRoom } from './entities/live-room.entity';
import { LiveProduct } from './entities/live-product.entity';
import { LiveChat } from './entities/live-chat.entity';
import { LiveFollow } from './entities/live-follow.entity';
import { LiveReplay } from './entities/live-replay.entity';
import { LiveRoomService } from './services/live-room.service';
import { LiveChatService } from './services/live-chat.service';
import { LiveProductService } from './services/live-product.service';
import { LiveFollowService } from './services/live-follow.service';
import { LiveReplayService } from './services/live-replay.service';
import { LiveRoomController } from './controllers/live-room.controller';
import { LiveChatController } from './controllers/live-chat.controller';
import { LiveProductController } from './controllers/live-product.controller';
import { LiveFollowController } from './controllers/live-follow.controller';
import { LiveReplayController } from './controllers/live-replay.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LiveRoom,
      LiveProduct,
      LiveChat,
      LiveFollow,
      LiveReplay,
    ]),
  ],
  controllers: [
    LiveRoomController,
    LiveChatController,
    LiveProductController,
    LiveFollowController,
    LiveReplayController,
  ],
  providers: [
    LiveRoomService,
    LiveChatService,
    LiveProductService,
    LiveFollowService,
    LiveReplayService,
  ],
  exports: [
    LiveRoomService,
    LiveProductService,
  ],
})
export class LiveModule {}