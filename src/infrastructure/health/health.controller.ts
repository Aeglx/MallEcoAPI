import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EnhancedHealthService, HealthStatus } from './enhanced-health.service';
import { SkipPerformance } from '../../common/decorators/skip-performance.decorator';

@ApiTags('健康检查')
@Controller('health')
@SkipPerformance()
export class HealthController {
  constructor(private readonly enhancedHealthService: EnhancedHealthService) {}

  @Get()
  @ApiOperation({ summary: '基础健康检查' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'MallEcoAPI',
    };
  }

  @Get('detailed')
  @ApiOperation({ summary: '详细健康检查' })
  async getDetailedHealth(): Promise<HealthStatus> {
    return await this.enhancedHealthService.getHealthStatus();
  }

  @Get('readiness')
  @ApiOperation({ summary: '就绪检查' })
  async getReadiness() {
    const health = await this.enhancedHealthService.getHealthStatus();

    return {
      status: health.status === 'healthy' ? 'ready' : 'not_ready',
      timestamp: health.timestamp,
      checks: health.checks,
    };
  }

  @Get('liveness')
  @ApiOperation({ summary: '存活检查' })
  getLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
