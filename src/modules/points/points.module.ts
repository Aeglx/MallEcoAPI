import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsController } from './controllers/points.controller';
import { PointsService } from './services/points.service';
import { PointsEntity } from './entities/points.entity';
import { PointsLogEntity } from './entities/points-log.entity';
import { PointsGoodsEntity } from './entities/points-goods.entity';
import { PointsExchangeEntity } from './entities/points-exchange.entity';
import { PointsRuleEntity } from './entities/points-rule.entity';
import { SignInRecordEntity } from './entities/signin-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PointsEntity,
      PointsLogEntity,
      PointsGoodsEntity,
      PointsExchangeEntity,
      PointsRuleEntity,
      SignInRecordEntity,
    ]),
  ],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}