import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogisticsController } from './controllers/logistics.controller';
import { LogisticsService } from './services/logistics.service';
import { LogisticsEntity } from './entities/logistics.entity';
import { LogisticsCompanyEntity } from './entities/logistics-company.entity';
import { FreightTemplateEntity } from './entities/freight-template.entity';
import { LogisticsTrackEntity } from './entities/logistics-track.entity';
import { ShipOrderEntity } from './entities/ship-order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LogisticsEntity,
      LogisticsCompanyEntity,
      FreightTemplateEntity,
      LogisticsTrackEntity,
      ShipOrderEntity,
    ]),
  ],
  controllers: [LogisticsController],
  providers: [LogisticsService],
  exports: [LogisticsService],
})
export class LogisticsModule {}