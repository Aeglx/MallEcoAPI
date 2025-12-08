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
// import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
// Import entities manually
import { Config } from '../modules/manager/config/entities/config.entity';
import { Log } from '../modules/manager/log/entities/log.entity';
import { Message } from '../modules/manager/messages/entities/message.entity';
import { MemberMessage } from '../modules/message/entities/member-message.entity';
import { StoreMessage } from '../modules/message/entities/store-message.entity';
import { Product } from './products/entities/product.entity';

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
        charset: configService.get('DB_CHARSET'),
        entities: [Config, Log, Message, MemberMessage, StoreMessage, Product],
        synchronize: configService.get('DB_SYNCHRONIZE'),
        logging: configService.get('DB_LOGGING'),
      }),
      inject: [ConfigService],
    }),
    // ElasticsearchModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     node: configService.get('ELASTICSEARCH_NODE'),
    //     auth: {
    //       username: configService.get('ELASTICSEARCH_USERNAME'),
    //       password: configService.get('ELASTICSEARCH_PASSWORD'),
    //     },
    //     cloud: {
    //       id: '',
    //     },
    //   }),
    //   inject: [ConfigService],
    // }),
    ProductsModule,
    StatisticsModule,
    ManagerModule,
    MessageModule,
    RabbitMQModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
