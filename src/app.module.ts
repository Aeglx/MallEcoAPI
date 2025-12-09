import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { StatisticsModule } from './statistics/statistics.module';
// import { join } from 'path';
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
// Import entities manually
import { Config } from '../modules/manager/config/entities/config.entity';
import { Log } from '../modules/manager/log/entities/log.entity';
import { Message } from '../modules/manager/messages/entities/message.entity';
import { MemberMessage } from '../modules/message/entities/member-message.entity';
import { StoreMessage } from '../modules/message/entities/store-message.entity';
import { Product } from './products/entities/product.entity';
import { Cart } from '../modules/buyer/cart/entities/cart.entity';
import { BuyerModule } from '../modules/buyer/buyer.module';
import { ImModule } from '../modules/im/im.module';
import { ChatRoom } from '../modules/im/entities/chat-room.entity';
import { ChatMessage } from '../modules/im/entities/chat-message.entity';
import { ImTalk } from '../modules/im/entities/im-talk.entity';
import { XxlJobModule } from '../modules/xxljob/xxljob.module';

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
        entities: [Config, Log, Message, MemberMessage, StoreMessage, Product, Cart, ChatRoom, ChatMessage, ImTalk],
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
