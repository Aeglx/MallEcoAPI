import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { LogModule } from './log/log.module';
import { MessagesModule } from './messages/messages.module';
import { ManagerProductsModule } from './products/products.module';
import { ManagerOrdersModule } from './orders/orders.module';
import { ManagerUsersModule } from './users/users.module';
import { ManagerLiveModule } from './live/live.module';

@Module({
  imports: [ConfigModule, LogModule, MessagesModule, ManagerProductsModule, ManagerOrdersModule, ManagerUsersModule, ManagerLiveModule],
  controllers: [],
  providers: [],
  exports: [ConfigModule, LogModule, MessagesModule, ManagerProductsModule, ManagerOrdersModule, ManagerUsersModule],
})
export class ManagerModule {}
