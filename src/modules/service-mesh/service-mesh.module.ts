import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceMeshController } from './controllers/service-mesh.controller';
import { ServiceMeshService } from './services/service-mesh.service';
import { MeshConfigEntity } from './entities/mesh-config.entity';
import { MeshGatewayEntity } from './entities/mesh-gateway.entity';
import { MeshPolicyEntity } from './entities/mesh-policy.entity';
import { MeshTelemetryEntity } from './entities/mesh-telemetry.entity';
import { MeshSecurityEntity } from './entities/mesh-security.entity';
import { MeshTrafficEntity } from './entities/mesh-traffic.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MeshConfigEntity,
      MeshGatewayEntity,
      MeshPolicyEntity,
      MeshTelemetryEntity,
      MeshSecurityEntity,
      MeshTrafficEntity,
    ]),
  ],
  controllers: [ServiceMeshController],
  providers: [ServiceMeshService],
  exports: [ServiceMeshService],
})
export class ServiceMeshModule {}
