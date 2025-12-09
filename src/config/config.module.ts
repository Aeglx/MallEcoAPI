import { Module, forwardRef } from '@nestjs/common';
import { GlobalConfigService } from './config.service';
import { ManagerModule } from '../../modules/manager/manager.module';

@Module({
  imports: [forwardRef(() => ManagerModule)],
  providers: [GlobalConfigService],
  exports: [GlobalConfigService],
})
export class GlobalConfigModule {}
