import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { PrometheusService } from './prometheus.service';
import { MonitoringMiddleware } from './monitoring.middleware';

@Module({
  controllers: [MonitoringController],
  providers: [PrometheusService, MonitoringMiddleware],
  exports: [PrometheusService, MonitoringMiddleware],
})
export class MonitoringModule {}
