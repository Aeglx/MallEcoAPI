import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { PaymentEntity } from './entities/payment.entity';
import { PaymentLogEntity } from './entities/payment-log.entity';
import { RefundRecordEntity } from './entities/refund-record.entity';
import { PaymentConfigEntity } from './entities/payment-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentEntity,
      PaymentLogEntity,
      RefundRecordEntity,
      PaymentConfigEntity,
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}