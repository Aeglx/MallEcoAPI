import { Module, Global, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExecutorRegistryService } from './services/executor-registry.service';
import { RedisTimeTriggerService } from './services/redis-time-trigger.service';
import { SchedulerService } from './scheduler.service';
import { OrderExecutorService } from './executors/order-executor.service';

/**
 * 分布式定时任务模块
 * 基于Redis实现分布式定时任务调度
 * 参考：MallEcoPro/src/shared/trigger/trigger.module.ts
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    ExecutorRegistryService,
    RedisTimeTriggerService,
    SchedulerService,
    OrderExecutorService, // 示例执行器
  ],
  exports: [ExecutorRegistryService, RedisTimeTriggerService, SchedulerService],
})
export class SchedulerModule implements OnModuleInit {
  constructor(
    private readonly executorRegistry: ExecutorRegistryService,
    private readonly orderExecutor: OrderExecutorService,
  ) {}

  onModuleInit() {
    // 注册所有执行器
    this.executorRegistry.register(this.orderExecutor);
  }
}

