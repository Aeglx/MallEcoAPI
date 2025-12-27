import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { EnhancedHealthService } from './enhanced-health.service';

@Module({
  imports: [],
  controllers: [HealthController],
  providers: [EnhancedHealthService],
})
export class HealthModule {}
