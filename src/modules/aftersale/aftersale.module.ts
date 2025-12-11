import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AfterSaleController } from './controllers/aftersale.controller';
import { AfterSaleService } from './services/aftersale.service';
import { AfterSaleEntity } from './entities/aftersale.entity';
import { AfterSaleLogEntity } from './entities/aftersale-log.entity';
import { AfterSaleCommunicationEntity } from './entities/aftersale-communication.entity';
import { ReturnGoodsEntity } from './entities/return-goods.entity';
import { ExchangeGoodsEntity } from './entities/exchange-goods.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AfterSaleEntity,
      AfterSaleLogEntity,
      AfterSaleCommunicationEntity,
      ReturnGoodsEntity,
      ExchangeGoodsEntity,
    ]),
  ],
  controllers: [AfterSaleController],
  providers: [AfterSaleService],
  exports: [AfterSaleService],
})
export class AfterSaleModule {}