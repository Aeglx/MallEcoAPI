import { Module } from '@nestjs/common';
import { LiveModule } from '../../common/live/live.module';
import { LiveController } from './live.controller';

@Module({
  imports: [LiveModule],
  controllers: [LiveController],
  providers: [],
  exports: []
})
export class ManagerLiveModule {}