import { Module, Global } from '@nestjs/common';
import { SeataService } from './seata.service';
import { SeataInterceptor } from './seata.interceptor';

@Global()
@Module({
  providers: [SeataService, SeataInterceptor],
  exports: [SeataService, SeataInterceptor],
})
export class SeataModule {}