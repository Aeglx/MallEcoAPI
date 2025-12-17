import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoodsFullController } from './controllers/goods-full.controller';
import { GoodsFullService } from './services/goods-full.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [GoodsFullController],
  providers: [GoodsFullService],
  exports: [GoodsFullService],
})
export class GoodsModule {}