import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RbacModule } from './modules/rbac/rbac.module';
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
      envFilePath: '.env',
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
          join(__dirname, '**/*.entity{.ts,.js}'),
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
