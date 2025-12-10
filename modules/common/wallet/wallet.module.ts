import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// 实体
import { Wallet } from './entities/wallet.entity';
import { WalletRecord } from './entities/wallet-record.entity';
import { Recharge } from './entities/recharge.entity';
import { Withdraw } from './entities/withdraw.entity';
import { Points, PointsRecord } from './entities/points.entity';
import { PointsGoods, PointsExchange } from './entities/points-goods.entity';

// 服务
import { WalletService } from './services/wallet.service';
import { RechargeService } from './services/recharge.service';
import { WithdrawService } from './services/withdraw.service';
import { PointsService } from './services/points.service';

// 其他依赖
import { MemberModule } from '../member/member.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // 钱包相关
      Wallet,
      WalletRecord,
      // 充值提现相关
      Recharge,
      Withdraw,
      // 积分相关
      Points,
      PointsRecord,
      PointsGoods,
      PointsExchange,
    ]),
    MemberModule,
  ],
  providers: [
    // 服务
    WalletService,
    RechargeService,
    WithdrawService,
    PointsService,
  ],
  exports: [
    // 导出服务供其他模块使用
    WalletService,
    RechargeService,
    WithdrawService,
    PointsService,
  ],
})
export class WalletModule {}