import { TimeTriggerMsg } from './time-trigger.interface';

/**
 * 延迟任务执行器接口
 * 参考：MallEcoPro/src/shared/trigger/executors/executor.interface.ts
 */
export interface DelayTaskExecutor {
  /**
   * 执行器名称
   */
  executorName: string;

  /**
   * 执行任务
   */
  execute(msg: TimeTriggerMsg): Promise<void>;
}

