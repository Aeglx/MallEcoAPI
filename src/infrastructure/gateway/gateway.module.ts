import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GatewayService } from './infrastructure/gateway.service';
import { GatewayController } from './infrastructure/gateway.controller';
import { ConsulModule } from '../consul/consul.module';

@Global()
@Module({
  imports: [HttpModule, ConsulModule],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}

