import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Consul from 'consul';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'CONSUL_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Consul({
          host: configService.get('CONSUL_HOST', 'localhost'),
          port: configService.get('CONSUL_PORT', 8500),
        });
      },
    },
  ],
  exports: ['CONSUL_CLIENT'],
})
export class ConsulModule {}
