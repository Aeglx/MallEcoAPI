import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AfterSales } from './entities/after-sales.entity';
import { AfterSalesController } from './controllers/after-sales.controller';
import { AfterSalesService } from './services/after-sales.service';
import { OrderModule } from '../order/order.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AfterSales]),
    OrderModule,
    PaymentModule
  ],
  controllers: [AfterSalesController],
  providers: [AfterSalesService],
  exports: [AfterSalesService]
})
export class AfterSalesModule {}
