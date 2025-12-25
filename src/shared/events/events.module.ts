import { Module, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventPublisherService } from './event-publisher.service';

/**
 * 事件系统模块
 * 参考：MallEcoPro/src/shared/events/events.module.ts
 */
@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
  ],
  providers: [EventPublisherService],
  exports: [EventPublisherService],
})
export class EventsModule {}

