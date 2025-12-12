import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { RabbitMQModule } from './infrastructur./infrastructure/rabbitmq/rabbitmq.module';
import { ConsulModule } from './consul/consul.module';
import { HealthModule } from './infrastructur./infrastructure/health/health.module';
import { GatewayModule } from './infrastructur./infrastructure/gateway/gateway.module';
import { SocialModule } from './social/social.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GlobalConfigModule } from './config/config.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';

// 多端分离模块导入
import { ManagerModule } from '../modules/client/manager/manager.module';
import { BuyerModule } from '../modules/client/buyer/buyer.module';
import { SellerModule } from '../modules/client/seller/seller.module';
import { MessageModule } from '../modules/service/message/message.module';
import { ImModule } from '../modules/service/im/im.module';
import { XxlJobModule } from '../modules/service/xxljob/xxljob.module';

// 核心业务模块导入
import { ProductsModule } from '../modules/products/products.module';
import { StatisticsModule } from '../modules/statistics/statistics.module';
import { DistributionModule } from '../modules/distribution/distribution.module';
import { LiveModule } from '../modules/live/live.module';
import { RbacModule } from '../modules/rbac/rbac.module';

// 新增核心电商模块
import { OrderModule } from '../modules/order/order.module';
import { PromotionModule } from '../modules/promotion/promotion.module';
import { MemberModule } from '../modules/member/member.module';
import { GoodsModule } from '../modules/goods/goods.module';
import { WalletModule } from '../modules/wallet/wallet.module';
import { PaymentModule } from '../modules/payment/payment.module';
import { AfterSaleModule } from '../modules/aftersale/aftersale.module';
import { LogisticsModule } from '../modules/logistics/logistics.module';
import { EvaluationModule } from '../modules/evaluation/evaluation.module';
import { PointsModule } from '../modules/points/points.module';

// 第三阶段架构优化模块
import { SystemModule } from '../modules/system/system.module';
import { CacheModule } from '../module./infrastructure/cache/cache.module';
import { DatabaseModule } from '../modules/database/database.module';
import { MicroservicesModule } from '../modules/microservices/microservices.module';
import { ServiceMeshModule } from '../modules/service-mesh/service-mesh.module';

// 高级功能模块
import { RecommendationModule } from '../modules/service/recommendation/recommendation.module';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      // 事件模块配置
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
    }),
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
        charset: configService.get('DB_CHARSET'),
        entities: [
          join(__dirname, '**/*.entity{.ts,.js}'),
          join(__dirname, '../modules/**/*.entity{.ts,.js}'),
        ],
        synchronize: configService.get('DB_SYNCHRONIZE'),
        logging: configService.get('DB_LOGGING'),
        // 数据库连接池配置
        extra: {
          connectionLimit: parseInt(configService.get('DB_CONNECTION_LIMIT', '10')),
          waitForConnections: true,
          queueLimit: 0,
        },
      }),
      inject: [ConfigService],
    }),
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        node: configService.get('ELASTICSEARCH_NODE'),
        auth: {
          username: configService.get('ELASTICSEARCH_USERNAME'),
          password: configService.get('ELASTICSEARCH_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    // 核心业务模块
    ProductsModule,
    StatisticsModule,
    DistributionModule,
    SocialModule,
    LiveModule,
    RbacModule,
    
    // 新增核心电商模块
    OrderModule,
    PromotionModule,
    MemberModule,
    GoodsModule,
    WalletModule,
    PaymentModule,
    AfterSaleModule,
    LogisticsModule,
    EvaluationModule,
    PointsModule,
    
    // 多端分离模块
    ManagerModule,
    BuyerModule,
    SellerModule,
    
    // 公共服务模块
    RabbitMQModule,
    ConsulModule,
    HealthModule,
    GatewayModule,
    GlobalConfigModule,
    MessageModule,
    ImModule,
    SearchModule,
    XxlJobModule,
    
    // 第三阶段架构优化模块
    SystemModule,
    CacheModule,
    DatabaseModule,
    MicroservicesModule,
    ServiceMeshModule,

    // 高级功能模块
    RecommendationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
  ],
})
export class AppModule {}

