import { Injectable, Logger, OnModuleDestroy, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { TimeTrigger, TimeTriggerMsg } from '../interfaces/time-trigger.interface';
import { ExecutorRegistryService } from './executor-registry.service';

/**
 * 基于Redis的分布式定时任务服务
 * 参考：MallEcoPro/src/shared/trigger/impl/redis-time-trigger.service.ts
 */
@Injectable()
export class RedisTimeTriggerService implements TimeTrigger, OnModuleDestroy {
  private readonly logger = new Logger(RedisTimeTriggerService.name);
  private redisClient: Redis;
  private scanInterval: NodeJS.Timeout | null = null;
  private readonly TASK_PREFIX = 'scheduler:task:';
  private readonly TASK_ZSET_KEY = 'scheduler:tasks:zset';
  private readonly SCAN_INTERVAL = 5000; // 5秒扫描一次

  constructor(
    private readonly configService: ConfigService,
    private readonly executorRegistry: ExecutorRegistryService,
  ) {
    this.initRedis();
    this.startScanning();
  }

  /**
   * 初始化Redis连接
   */
  private initRedis(): void {
    this.redisClient = new Redis({
      host: this.configService.get('REDIS_HOST') || 'localhost',
      port: parseInt(this.configService.get('REDIS_PORT') || '6379', 10),
      password: this.configService.get('REDIS_PASSWORD'),
      db: parseInt(this.configService.get('REDIS_DB') || '0', 10),
      retryStrategy: times => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redisClient.on('error', error => {
      this.logger.error('Redis connection error:', error);
    });

    this.redisClient.on('connect', () => {
      this.logger.log('Redis connected for scheduler');
    });
  }

  /**
   * 启动定时扫描任务
   */
  private startScanning(): void {
    this.scanInterval = setInterval(async () => {
      await this.scanAndExecute();
    }, this.SCAN_INTERVAL);
  }

  /**
   * 扫描并执行到期任务
   */
  private async scanAndExecute(): Promise<void> {
    try {
      const now = Math.floor(Date.now() / 1000); // 当前时间戳（秒）

      // 从ZSET中获取到期的任务（score <= now）
      const dueTasks = await this.redisClient.zrangebyscore(
        this.TASK_ZSET_KEY,
        0,
        now,
        'LIMIT',
        0,
        100, // 每次最多处理100个任务
      );

      if (dueTasks.length === 0) {
        return;
      }

      this.logger.debug(`Found ${dueTasks.length} due tasks`);

      // 并发执行任务
      const promises = dueTasks.map(taskKey => this.executeTask(taskKey));
      await Promise.allSettled(promises);
    } catch (error) {
      this.logger.error('Error scanning and executing tasks:', error);
    }
  }

  /**
   * 执行单个任务
   */
  private async executeTask(taskKey: string): Promise<void> {
    try {
      // 从Redis获取任务数据
      const taskData = await this.redisClient.get(taskKey);
      if (!taskData) {
        // 任务已被删除，从ZSET中移除
        await this.redisClient.zrem(this.TASK_ZSET_KEY, taskKey);
        return;
      }

      const timeTriggerMsg: TimeTriggerMsg = JSON.parse(taskData);

      // 执行任务
      await this.execute(timeTriggerMsg);

      // 从ZSET和Hash中删除任务
      await this.redisClient.zrem(this.TASK_ZSET_KEY, taskKey);
      await this.redisClient.del(taskKey);

      this.logger.log(`Task executed and removed: ${taskKey}`);
    } catch (error) {
      this.logger.error(`Error executing task ${taskKey}:`, error);
    }
  }

  /**
   * 添加延时任务
   */
  async addDelay(timeTriggerMsg: TimeTriggerMsg): Promise<void> {
    const taskKey = this.buildTaskKey(timeTriggerMsg);
    const triggerTime = timeTriggerMsg.delayTime
      ? Math.floor(Date.now() / 1000) + timeTriggerMsg.delayTime
      : timeTriggerMsg.triggerTime;

    // 更新触发时间
    timeTriggerMsg.triggerTime = triggerTime;

    // 存储任务数据
    await this.redisClient.set(taskKey, JSON.stringify(timeTriggerMsg));

    // 添加到ZSET（使用触发时间作为score）
    await this.redisClient.zadd(this.TASK_ZSET_KEY, triggerTime, taskKey);

    this.logger.log(`Added delay task: ${taskKey}, triggerTime: ${triggerTime}`);
  }

  /**
   * 执行任务
   */
  async execute(timeTriggerMsg: TimeTriggerMsg): Promise<void> {
    this.logger.log(`Executing task: ${timeTriggerMsg.executorName}`, timeTriggerMsg.param);

    const executor = this.executorRegistry.get(timeTriggerMsg.executorName);
    if (!executor) {
      this.logger.warn(`Executor not found: ${timeTriggerMsg.executorName}`);
      throw new Error(`Executor not found: ${timeTriggerMsg.executorName}`);
    }

    try {
      await executor.execute(timeTriggerMsg);
    } catch (error) {
      this.logger.error(`Error executing task ${timeTriggerMsg.executorName}:`, error);
      throw error;
    }
  }

  /**
   * 修改延时任务
   */
  async edit(
    executorName: string,
    param: any,
    oldTriggerTime: number,
    triggerTime: number,
    uniqueKey: string,
    delayTime: number,
    topic: string,
  ): Promise<void> {
    const oldTaskKey = this.buildKey(executorName, oldTriggerTime, uniqueKey);
    const newTaskKey = this.buildKey(executorName, triggerTime, uniqueKey);

    // 删除旧任务
    await this.delete(executorName, oldTriggerTime, uniqueKey, topic);

    // 添加新任务
    const newMsg: TimeTriggerMsg = {
      executorName,
      param,
      triggerTime,
      uniqueKey,
      delayTime,
      topic,
    };
    await this.addDelay(newMsg);
  }

  /**
   * 删除延时任务
   */
  async delete(
    executorName: string,
    triggerTime: number,
    uniqueKey: string,
    topic: string,
  ): Promise<void> {
    const taskKey = this.buildKey(executorName, triggerTime, uniqueKey);

    // 从ZSET中删除
    await this.redisClient.zrem(this.TASK_ZSET_KEY, taskKey);

    // 删除任务数据
    await this.redisClient.del(taskKey);

    this.logger.log(`Deleted delay task: ${taskKey}`);
  }

  /**
   * 构建任务key
   */
  private buildTaskKey(msg: TimeTriggerMsg): string {
    return this.buildKey(msg.executorName, msg.triggerTime, msg.uniqueKey);
  }

  /**
   * 构建任务key
   */
  private buildKey(executorName: string, triggerTime: number, uniqueKey: string): string {
    return `${this.TASK_PREFIX}${executorName}:${triggerTime}:${uniqueKey}`;
  }

  /**
   * 获取待执行任务数量
   */
  async getPendingTaskCount(): Promise<number> {
    return await this.redisClient.zcard(this.TASK_ZSET_KEY);
  }

  /**
   * 清理资源
   */
  onModuleDestroy(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
    if (this.redisClient) {
      this.redisClient.quit();
    }
  }
}
