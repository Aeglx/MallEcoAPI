import { Module } from '@nestjs/common';
import { HealthController } from './infrastructure/health.controller';
import { EnhancedHealthService } from './enhanced-health.service';
import { DatabaseModule } from '../modules/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [HealthController],
  providers: [EnhancedHealthService],
  exports: [EnhancedHealthService],
})
export class HealthModule {}

