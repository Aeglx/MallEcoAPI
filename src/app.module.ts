import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { AuthModule } from '../modules/common/auth/auth.module';
import { OrderModule } from '../modules/common/order/order.module';
import { ProductModule } from '../modules/common/product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: process.env.DB_CHARSET,
      synchronize: Boolean(process.env.DB_SYNCHRONIZE),
      logging: Boolean(process.env.DB_LOGGING),
      autoLoadEntities: true,
    }),
    ProductsModule,
    AuthModule,
    OrderModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
