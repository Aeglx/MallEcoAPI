import { Module } from '@nestjs/common';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';

@Module({
  controllers: [TradeController, CartsController],
  providers: [TradeService, CartsService],
  exports: [TradeService, CartsService],
})
export class TradeModule {}