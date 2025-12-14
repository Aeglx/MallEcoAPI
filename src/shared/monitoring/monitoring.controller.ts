import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { PerformanceService } from './performance.service';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('metrics')
  async getMetrics(@Res() response: Response) {
    const metrics = await this.performanceService.getMetrics();
    response.set('Content-Type', 'text/plain');
    response.send(metrics);
  }

  @Get('performance-summary')
  getPerformanceSummary() {
    const summary = this.performanceService.getPerformanceSummary();
    return {
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
    };
  }
}