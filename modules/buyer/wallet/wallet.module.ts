import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WalletEntity } from './entities/wallet.entity';
import { WalletTransactionEntity } from './entities/wallet-transaction.entity';
import { RechargeOrderEntity } from './entities/recharge-order.entity';
import { WithdrawOrderEntity } from './entities/withdraw-order.entity';
import { PointsProductEntity } from './entities/points-product.entity';
import { PointsExchangeEntity } from './entities/points-exchange.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletEntity,
      WalletTransactionEntity,
      RechargeOrderEntity,
      WithdrawOrderEntity,
      PointsProductEntity,
      PointsExchangeEntity,
    ]),
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}