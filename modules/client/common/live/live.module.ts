import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveRoom } from './entities/live-room.entity';
import { LiveGoods } from './entities/live-goods.entity';
import { LiveOrder } from './entities/live-order.entity';
import { LiveChat } from './entities/live-chat.entity';
import { LiveStatistics } from './entities/live-statistics.entity';
import { LiveRoomService } from './services/live-room.service';
import { LiveGoodsService } from './services/live-goods.service';
import { LiveOrderService } from './services/live-order.service';
import { LiveChatService } from './services/live-chat.service';
import { LiveStatisticsService } from './services/live-statistics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LiveRoom,
      LiveGoods,
      LiveOrder,
      LiveChat,
      LiveStatistics
    ])
  ],
  providers: [
    LiveRoomService,
    LiveGoodsService,
    LiveOrderService,
    LiveChatService,
    LiveStatisticsService
  ],
  exports: [
    LiveRoomService,
    LiveGoodsService,
    LiveOrderService,
    LiveChatService,
    LiveStatisticsService
  ]
})
export class LiveModule {}