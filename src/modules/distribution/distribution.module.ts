import { Module } from '@nestjs/common';
import { DistributionController } from './distribution.controller';
import { DistributionService } from './distribution.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Distributor } from './entities/distributor.entity';
import { CommissionRecord } from './entities/commission-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Distributor, CommissionRecord])],
  controllers: [DistributionController],
  providers: [DistributionService],
})
export class DistributionModule {}
