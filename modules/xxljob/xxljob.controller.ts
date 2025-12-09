import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ExecutorService } from './services/executor.service';

@Controller('xxl-job')
export class XxlJobController {
  private readonly logger = new Logger(XxlJobController.name);

  constructor(private readonly executorService: ExecutorService) {}

  /**
   * 任务执行接口
   */
  @Post('run')
  async runJob(@Body() body: any) {
    this.logger.debug('接收到任务执行请求', body);
    return this.executorService.runJob(
      body.jobId,
      body.executorHandler,
      body.executorParams,
      body.logId,
      body.logDateTime,
      body.glueType,
      body.glueSource,
      body.glueUpdatetime,
      body.broadcastIndex,
      body.broadcastTotal,
    );
  }

  /**
   * 任务终止接口
   */
  @Post('kill')
  async killJob(@Body() body: any) {
    this.logger.debug('接收到任务终止请求', body);
    return this.executorService.killJob(body.jobId, body.executorParams);
  }

  /**
   * 任务日志接口
   */
  @Post('log')
  async log(@Body() body: any) {
    this.logger.debug('接收到任务日志请求', body);
    return this.executorService.log(body.jobId, body.logId, body.fromLineNum);
  }

  /**
   * 执行器注册接口
   */
  @Post('registry')
  async registry(@Body() body: any) {
    this.logger.debug('接收到执行器注册请求', body);
    return this.executorService.registry();
  }

  /**
   * 执行器心跳接口
   */
  @Post('beat')
  async beat(@Body() body: any) {
    this.logger.debug('接收到执行器心跳请求', body);
    return this.executorService.beat();
  }
}
