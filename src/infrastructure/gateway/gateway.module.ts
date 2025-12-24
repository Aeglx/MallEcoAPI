import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GatewayService } from './gateway.service';
import { GatewayController } from './gateway.controller';

@Global()
@Module({
  imports: [HttpModule],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}

