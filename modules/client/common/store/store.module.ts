import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { StoreLog } from './entities/store-log.entity';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store, StoreLog]),
    ProductModule,
  ],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService, TypeOrmModule.forFeature([Store, StoreLog])],
})
export class StoreModule {}
