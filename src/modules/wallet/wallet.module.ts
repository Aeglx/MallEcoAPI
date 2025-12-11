import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './controllers/wallet.controller';
import { WalletService } from './services/wallet.service';
import { WalletEntity } from './entities/wallet.entity';
import { WalletLogEntity } from './entities/wallet-log.entity';
import { WithdrawApplicationEntity } from './entities/withdraw-application.entity';
import { RechargeRecordEntity } from './entities/recharge-record.entity';
import { FreezeRecordEntity } from './entities/freeze-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletEntity,
      WalletLogEntity,
      WithdrawApplicationEntity,
      RechargeRecordEntity,
      FreezeRecordEntity,
    ]),
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}