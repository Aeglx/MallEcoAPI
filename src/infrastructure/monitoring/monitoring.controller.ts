import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrometheusService } from './prometheus.service';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Get('metrics')
  async getMetrics(@Res() res: Response) {
    try {
      const metrics = await this.prometheusService.getMetrics();
      res.set('Content-Type', 'text/plain');
      res.send(metrics);
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to retrieve metrics',
        message: error.message 
      });
    }
  }

  @Get('health')
  getHealth() {
    const healthStatus = this.prometheusService.getHealthStatus();
    return {
      status: healthStatus.status,
      timestamp: new Date().toISOString(),
      metrics: {
        memory_usage_percent: healthStatus.memory,
        cpu_usage_percent: healthStatus.cpu,
        uptime_seconds: healthStatus.uptime,
      }
    };
  }

  @Get('stats')
  async getStats() {
    // 这里可以返回更详细的统计信息
    return {
      application: {
        name: 'MallEcoAPI',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
      system: {
        node_version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      performance: {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
      }
    };
  }
}