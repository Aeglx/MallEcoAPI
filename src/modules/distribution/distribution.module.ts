import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Distribution } from './entities/distribution.entity';
import { DistributionGoods } from './entities/distribution-goods.entity';
import { DistributionOrder } from './entities/distribution-order.entity';
import { DistributionCash } from './entities/distribution-cash.entity';

// Controllers
import { DistributionController } from './controllers/distribution.controller';
import { DistributionGoodsController } from './controllers/distribution-goods.controller';
import { DistributionOrderController } from './controllers/distribution-order.controller';
import { DistributionCashController } from './controllers/distribution-cash.controller';

// Services
import { DistributionService } from './services/distribution.service';
import { DistributionGoodsService } from './services/distribution-goods.service';
import { DistributionOrderService } from './services/distribution-order.service';
import { DistributionCashService } from './services/distribution-cash.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Distribution,
      DistributionGoods,
      DistributionOrder,
      DistributionCash,
    ]),
  ],
  controllers: [
    DistributionController,
    DistributionGoodsController,
    DistributionOrderController,
    DistributionCashController,
  ],
  providers: [
    DistributionService,
    DistributionGoodsService,
    DistributionOrderService,
    DistributionCashService,
  ],
  exports: [
    DistributionService,
    DistributionGoodsService,
    DistributionOrderService,
    DistributionCashService,
  ],
})
export class DistributionModule {}