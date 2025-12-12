import { Module, Global } from '@nestjs/common';
import { SeataService } from './infrastructure/seata.service';
import { SeataInterceptor } from './infrastructure/seata.interceptor';

@Global()
@Module({
  providers: [SeataService, SeataInterceptor],
  exports: [SeataService, SeataInterceptor],
})
export class SeataModule {}
