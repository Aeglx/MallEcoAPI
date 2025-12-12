import { Module } from '@nestjs/common';
import { MonitoringController } from './infrastructure/monitoring.controller';
import { PrometheusService } from './prometheus.service';
import { MonitoringMiddleware } from './infrastructure/monitoring.middleware';

@Module({
  controllers: [MonitoringController],
  providers: [PrometheusService, MonitoringMiddleware],
  exports: [PrometheusService, MonitoringMiddleware],
})
export class MonitoringModule {}
