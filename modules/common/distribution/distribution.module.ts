import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistributionService } from './distribution.service';
import { DistributionCashService } from './distribution-cash.service';
import { DistributionGoodsService } from './distribution-goods.service';
import { DistributionOrderService } from './distribution-order.service';
import { Distribution } from './entities/distribution.entity';
import { DistributionCash } from './entities/distribution-cash.entity';
import { DistributionGoods } from './entities/distribution-goods.entity';
import { DistributionOrder } from './entities/distribution-order.entity';
import { DistributionLevel } from './entities/distribution-level.entity';
import { Member } from '../member/entities/member.entity';
import { Order } from '../order/entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { Store } from '../store/entities/store.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Distribution,
      DistributionCash,
      DistributionGoods,
      DistributionOrder,
      DistributionLevel,
      Member,
      Order,
      Product,
      Store,
    ]),
  ],
  providers: [
    DistributionService,
    DistributionCashService,
    DistributionGoodsService,
    DistributionOrderService,
  ],
  exports: [
    DistributionService,
    DistributionCashService,
    DistributionGoodsService,
    DistributionOrderService,
  ],
})
export class DistributionModule {}