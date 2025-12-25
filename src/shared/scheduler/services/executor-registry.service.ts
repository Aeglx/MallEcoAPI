import { Injectable, Logger } from '@nestjs/common';
import { DelayTaskExecutor } from '../interfaces/executor.interface';

/**
 * 执行器注册服务
 * 参考：MallEcoPro/src/shared/trigger/executors/executor-registry.service.ts
 */
@Injectable()
export class ExecutorRegistryService {
  private readonly logger = new Logger(ExecutorRegistryService.name);
  private readonly executors = new Map<string, DelayTaskExecutor>();

  /**
   * 注册执行器
   */
  register(executor: DelayTaskExecutor): void {
    if (this.executors.has(executor.executorName)) {
      this.logger.warn(`Executor ${executor.executorName} already registered, overwriting`);
    }
    this.executors.set(executor.executorName, executor);
    this.logger.log(`Registered executor: ${executor.executorName}`);
  }

  /**
   * 获取执行器
   */
  get(executorName: string): DelayTaskExecutor | undefined {
    return this.executors.get(executorName);
  }

  /**
   * 获取所有执行器
   */
  getAll(): DelayTaskExecutor[] {
    return Array.from(this.executors.values());
  }

  /**
   * 检查执行器是否存在
   */
  has(executorName: string): boolean {
    return this.executors.has(executorName);
  }

  /**
   * 取消注册执行器
   */
  unregister(executorName: string): boolean {
    return this.executors.delete(executorName);
  }
}

