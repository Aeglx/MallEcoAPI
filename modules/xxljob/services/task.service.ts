import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  /**
   * 每小时执行一次的基础任务
   */
  @Cron(CronExpression.EVERY_HOUR)
  handleEveryHour() {
    this.logger.debug('每小时执行一次的任务');
  }

  /**
   * 每天凌晨1点执行的基础任务
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  handleEveryDayAt1AM() {
    this.logger.debug('每天凌晨1点执行的任务');
  }

  /**
   * 每周一凌晨2点执行的基础任务
   */
  @Cron('0 0 2 * * 1')
  handleEveryWeekMondayAt2AM() {
    this.logger.debug('每周一凌晨2点执行的任务');
  }

  /**
   * 每月1号凌晨3点执行的基础任务
   */
  @Cron('0 0 3 1 * *')
  handleEveryMonthFirstDayAt3AM() {
    this.logger.debug('每月1号凌晨3点执行的任务');
  }
}
