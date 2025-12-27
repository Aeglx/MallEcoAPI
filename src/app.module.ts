import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { throttlerConfig } from './config/rate-limit.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RbacModule } from './modules/rbac/rbac.module';
import { GoodsModule } from './modules/goods/goods.module';
import { ProductsModule } from './products/products.module';
// import { SystemModule } from './modules/system/system.module';
// import { StatisticsModule } from './statistics/statistics.module';
import { CacheModule } from './modules/cache/cache.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { PromotionModule } from './modules/promotion/promotion.module';
import { DistributionModule } from './modules/distribution/distribution.module';
import { ContentModule } from './modules/content/content.module';
import { LiveModule } from './modules/live/live.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SmsModule } from './modules/sms/sms.module';
import { EmailModule } from './modules/email/email.module';
import { FileModule } from './modules/file/file.module';
import { BuyerModule } from './modules/buyer/buyer.module';
import { CommonModule } from './modules/common/common.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { LogisticsModule } from './modules/logistics/logistics.module';
import { ManagerModule } from './modules/manager/manager.module';
import { SellerModule } from './modules/seller/seller.module';
import { ImModule } from './modules/im/im.module';
import { AddressModule } from './modules/address/address.module';
import { MemberModule } from './modules/member/member.module';
import { StoreModule } from './modules/store/store.module';
import { TradeModule } from './modules/trade/trade.module';
import { OtherModule } from './modules/other/other.module';
import { WechatModule } from './modules/wechat/wechat.module';
import { MenuModule } from './modules/menu/menu.module';
import { configurations } from './config/configuration';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { PerformanceInterceptor } from './shared/interceptors/performance.interceptor';
import { PerformanceService } from './shared/monitoring/performance.service';
import { MonitoringController } from './shared/monitoring/monitoring.controller';
import { AopModule } from './shared/aop/aop.module';
import { EventsModule } from './shared/events/events.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { SchedulerModule } from './shared/scheduler/scheduler.module';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    // 静态文件服务 - 提供 public 目录下的文件访问
    // 在开发环境中，__dirname 指向 dist/src，所以需要向上两级到项目根目录
    // 在生产环境中，__dirname 指向 dist，所以需要向上一级到项目根目录
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
      exclude: ['/api*'], // 排除 API 路由
    }),
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
    // API限流配置
    ThrottlerModule.forRoot(throttlerConfig),
    // 可选数据库连接 - 在没有MySQL的情况下应用程序仍能运行
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_NAME', 'malleco'),
        charset: configService.get('DB_CHARSET', 'utf8mb4'),
        entities: [
          join(__dirname, 'modules/framework/**/*.entity{.ts,.js}'),
          join(__dirname, '**/*.entity{.ts,.js}'),
        ],
        synchronize: configService.get('DB_SYNC', 'false') === 'true', // 开发环境可开启
        logging: configService.get('DB_LOGGING', 'false') === 'true', // 开发环境可开启
        retryAttempts: 3, // 连接重试
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
    GoodsModule,
    ProductsModule,
    // SystemModule,
    // StatisticsModule,
    CacheModule,
    AuthModule,
    UsersModule,
    CartModule,
    OrdersModule,
    WalletModule,
    PromotionModule,
    DistributionModule,
    ContentModule,
    LiveModule,
    PaymentModule,
    SmsModule,
    EmailModule,
    FileModule,
    BuyerModule,
    CommonModule,
    LogisticsModule,
    FeedbackModule,
    ManagerModule,
    SellerModule,
    ImModule,
    AddressModule,
    MemberModule,
    StoreModule,
    TradeModule,
    OtherModule,
    WechatModule,
    MenuModule,
    AopModule,
    EventsModule,
    InfrastructureModule,
    SchedulerModule,
  ],
  controllers: [AppController, MonitoringController],
  providers: [
    AppService,
    PerformanceService,
    // 全局启用限流守卫
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
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
