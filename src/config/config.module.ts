import { Module } from '@nestjs/common';
import { GlobalConfigService } from './config.service';

@Module({
  providers: [GlobalConfigService],
  exports: [GlobalConfigService],
})
export class GlobalConfigModule {}
