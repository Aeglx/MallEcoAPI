import { Injectable, Logger } from '@nestjs/common';
import { RedisTimeTriggerService } from './services/redis-time-trigger.service';
import { TimeTriggerMsg } from './interfaces/time-trigger.interface';

/**
 * 定时任务调度服务
 * 提供便捷的任务调度API
 */
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly timeTrigger: RedisTimeTriggerService) {}

  /**
   * 调度延迟任务
   * @param executorName 执行器名称
   * @param param 任务参数
   * @param delaySeconds 延迟秒数
   * @param uniqueKey 唯一标识（可选）
   */
  async schedule(
    executorName: string,
    param: any,
    delaySeconds: number,
    uniqueKey?: string,
  ): Promise<void> {
    const msg: TimeTriggerMsg = {
      executorName,
      param,
      triggerTime: Math.floor(Date.now() / 1000) + delaySeconds,
      uniqueKey: uniqueKey || `${executorName}_${Date.now()}`,
      delayTime: delaySeconds,
    };

    await this.timeTrigger.addDelay(msg);
    this.logger.log(`Scheduled task: ${executorName}, delay: ${delaySeconds}s`);
  }

  /**
   * 调度定时任务（指定执行时间）
   * @param executorName 执行器名称
   * @param param 任务参数
   * @param triggerTime 触发时间（时间戳，秒）
   * @param uniqueKey 唯一标识（可选）
   */
  async scheduleAt(
    executorName: string,
    param: any,
    triggerTime: number,
    uniqueKey?: string,
  ): Promise<void> {
    const msg: TimeTriggerMsg = {
      executorName,
      param,
      triggerTime,
      uniqueKey: uniqueKey || `${executorName}_${Date.now()}`,
    };

    await this.timeTrigger.addDelay(msg);
    this.logger.log(
      `Scheduled task at: ${executorName}, time: ${new Date(triggerTime * 1000).toISOString()}`,
    );
  }

  /**
   * 取消任务
   */
  async cancel(
    executorName: string,
    triggerTime: number,
    uniqueKey: string,
    topic?: string,
  ): Promise<void> {
    await this.timeTrigger.delete(executorName, triggerTime, uniqueKey, topic || '');
    this.logger.log(`Cancelled task: ${executorName}, key: ${uniqueKey}`);
  }

  /**
   * 获取待执行任务数量
   */
  async getPendingTaskCount(): Promise<number> {
    return await this.timeTrigger.getPendingTaskCount();
  }
}
