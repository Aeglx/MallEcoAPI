import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './modules/common/products/products.module';
import { AuthModule } from './modules/common/auth/auth.module';
import { OrderModule } from './modules/common/order/order.module';
import { ProductModule } from './modules/common/product/product.module';
import { PaymentModule } from './modules/common/payment/payment.module';
import { PromotionModule } from './modules/common/promotion/promotion.module';
import { LogisticsModule } from './modules/common/logistics/logistics.module';
import { StoreModule } from './modules/common/store/store.module';
import { MemberModule } from './modules/common/member/member.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService]
    }),
    ProductsModule,
    AuthModule,
    OrderModule,
    ProductModule,
    PaymentModule,
    PromotionModule,
    LogisticsModule,
    StoreModule,
    MemberModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
