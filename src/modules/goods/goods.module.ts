import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoodsFullController } from './controllers/goods-full.controller';
import { GoodsFullService } from './services/goods-full.service';
import { GoodsController } from './goods.controller';
import { GoodsService } from './goods.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [GoodsFullController, GoodsController],
  providers: [GoodsFullService, GoodsService],
  exports: [GoodsFullService, GoodsService],
})
export class GoodsModule {}
