import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// Import modules from the unified modules directory
import { ProductsModule } from './modules/products/products.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { join } from 'path';
import { ManagerModule } from '../modules/manager/manager.module';
import { MessageModule } from '../modules/message/message.module';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { ConsulModule } from './consul/consul.module';
import { HealthModule } from './health/health.module';
import { GatewayModule } from './gateway/gateway.module';
import { SocialModule } from './social/social.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GlobalConfigModule } from './config/config.module';
// Use dynamic entity loading instead of manual imports
// Import modules
import { BuyerModule } from '../modules/buyer/buyer.module';
import { ImModule } from '../modules/im/im.module';
import { XxlJobModule } from '../modules/xxljob/xxljob.module';
// Use the search module from the unified modules directory
// import { SearchModule } from './modules/search/search.module';

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
    ProductsModule,
    StatisticsModule,
    ManagerModule,
    MessageModule,
    RabbitMQModule,
    ConsulModule,
    HealthModule,
    GatewayModule,
    SocialModule,
    GlobalConfigModule,
    BuyerModule,
    ImModule,
    XxlJobModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
