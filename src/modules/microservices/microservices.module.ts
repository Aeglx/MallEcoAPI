import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MicroservicesController } from './controllers/microservices.controller';
import { MicroservicesService } from './services/microservices.service';
import { ServiceRegistryEntity } from './entities/service-registry.entity';
import { ServiceConfigEntity } from './entities/service-config.entity';
import { ServiceMetricsEntity } from './entities/service-metrics.entity';
import { ServiceDiscoveryEntity } from './entities/service-discovery.entity';
import { LoadBalancerEntity } from './entities/load-balancer.entity';
import { CircuitBreakerEntity } from './entities/circuit-breaker.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceRegistryEntity,
      ServiceConfigEntity,
      ServiceMetricsEntity,
      ServiceDiscoveryEntity,
      LoadBalancerEntity,
      CircuitBreakerEntity,
    ]),
  ],
  controllers: [MicroservicesController],
  providers: [MicroservicesService],
  exports: [MicroservicesService],
})
export class MicroservicesModule {}
