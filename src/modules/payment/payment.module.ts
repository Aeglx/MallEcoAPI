import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { AlipayService } from './services/alipay.service';
import { WechatPayService } from './services/wechatpay.service';
import { PaymentRecord } from './entities/payment-record.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentCallbackLog } from './entities/payment-callback-log.entity';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentRecord, PaymentMethod, PaymentCallbackLog]),
    OrdersModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, AlipayService, WechatPayService],
  exports: [PaymentService],
})
export class PaymentModule {}
