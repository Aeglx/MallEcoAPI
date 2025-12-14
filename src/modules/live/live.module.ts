import { Module } from '@nestjs/common';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveRoom } from './entities/live-room.entity';
import { LiveGoods } from './entities/live-goods.entity';
import { LiveStatistics } from './entities/live-statistics.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LiveRoom, LiveGoods, LiveStatistics])],
  controllers: [LiveController],
  providers: [LiveService],
})
export class LiveModule {}
