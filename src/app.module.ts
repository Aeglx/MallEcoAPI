import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RbacModule } from './modules/rbac/rbac.module';
import { ProductsModule } from './products/products.module';
import { SystemModule } from './modules/system/system.module';
import { StatisticsModule } from './statistics/statistics.module';
import { CacheModule } from './modules/cache/cache.module';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { PromotionModule } from './modules/promotion/promotion.module';
import { DistributionModule } from './modules/distribution/distribution.module';
import { ContentModule } from './modules/content/content.module';
import { LiveModule } from './modules/live/live.module';
import { configurations } from './config/configuration';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { PerformanceInterceptor } from './shared/interceptors/performance.interceptor';
import { PerformanceService } from './shared/monitoring/performance.service';
import { MonitoringController } from './shared/monitoring/monitoring.controller';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'config/.env',
    }),
    // 可选数据库连接 - 在没有MySQL的情况下应用程序仍能运行
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        charset: configService.get('DB_CHARSET'),
        entities: [
          join(__dirname, 'modules/rbac/**/*.entity{.ts,.js}'),
          join(__dirname, 'modules/auth/**/*.entity{.ts,.js}'),
          join(__dirname, 'modules/users/**/*.entity{.ts,.js}'),
          join(__dirname, 'modules/products/**/*.entity{.ts,.js}'),
          join(__dirname, 'modules/orders/**/*.entity{.ts,.js}'),
          join(__dirname, 'modules/cart/**/*.entity{.ts,.js}'),
          join(__dirname, 'modules/promotion/**/*.entity{.ts,.js}'),
          join(__dirname, 'modules/distribution/**/*.entity{.ts,.js}'),
          join(__dirname, 'modules/content/**/*.entity{.ts,.js}'),
          join(__dirname, 'social/**/*.entity{.ts,.js}'),
        ],
        synchronize: false, // 强制禁用同步
        logging: false, // 禁用日志
        // 添加连接重试和错误处理
        retryAttempts: 0, // 不重试连接
        retryDelay: 1000,
      }),
      inject: [ConfigService],
      // 使数据库连接成为非必需的
      extraProviders: [
        {
          provide: 'TYPEORM_CONNECTION_OPTIONS',
          useFactory: (configService: ConfigService) => ({
            type: 'mysql',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_NAME'),
            charset: configService.get('DB_CHARSET'),
            entities: [
              join(__dirname, '**/*.entity{.ts,.js}'),
            ],
            synchronize: false,
            logging: false,
          }),
          inject: [ConfigService],
        },
      ],
    }),
    RbacModule,
    ProductsModule,
    SystemModule,
    StatisticsModule,
    CacheModule,
    AuthModule,
    CartModule,
    OrdersModule,
    WalletModule,
    PromotionModule,
    DistributionModule,
    ContentModule,
    LiveModule,
  ],
  controllers: [AppController, MonitoringController],
  providers: [
    AppService,
    PerformanceService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
