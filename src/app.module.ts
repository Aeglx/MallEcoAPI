import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { StatisticsModule } from './statistics/statistics.module';
// import { join } from 'path';
import { ManagerModule } from '../modules/manager/manager.module';
// import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 暂时移除TypeORM模块，先确保其他模块正常工作
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
    RabbitMQModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
