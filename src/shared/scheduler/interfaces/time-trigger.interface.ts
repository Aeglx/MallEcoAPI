/**
 * 延迟任务消息
 * 参考：MallEcoPro/src/shared/trigger/time-trigger.interface.ts
 */
export interface TimeTriggerMsg {
  /** 执行器名称 */
  executorName: string;
  /** 执行参数 */
  param: any;
  /** 执行时间（时间戳，秒） */
  triggerTime: number;
  /** 唯一凭证 */
  uniqueKey: string;
  /** 延时时间（秒） */
  delayTime?: number;
  /** Topic */
  topic?: string;
}

/**
 * 延时执行接口
 */
export interface TimeTrigger {
  /**
   * 添加延时任务
   */
  addDelay(timeTriggerMsg: TimeTriggerMsg): Promise<void>;

  /**
   * 执行延时任务
   */
  execute(timeTriggerMsg: TimeTriggerMsg): Promise<void>;

  /**
   * 修改延时任务
   */
  edit(
    executorName: string,
    param: any,
    oldTriggerTime: number,
    triggerTime: number,
    uniqueKey: string,
    delayTime: number,
    topic: string,
  ): Promise<void>;

  /**
   * 删除延时任务
   */
  delete(
    executorName: string,
    triggerTime: number,
    uniqueKey: string,
    topic: string,
  ): Promise<void>;
}
