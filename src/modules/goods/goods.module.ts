import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoodsController } from './controllers/goods.controller';
import { GoodsService } from './services/goods.service';
import { GoodsEntity } from './entities/goods.entity';
import { GoodsCategoryEntity } from './entities/goods-category.entity';
import { GoodsSpecEntity } from './entities/goods-spec.entity';
import { GoodsSkuEntity } from './entities/goods-sku.entity';
import { GoodsBrandEntity } from './entities/goods-brand.entity';
import { GoodsCommentEntity } from './entities/goods-comment.entity';
import { GoodsCollectionEntity } from './entities/goods-collection.entity';
import { GoodsLabelEntity } from './entities/goods-label.entity';
import { GoodsUnitEntity } from './entities/goods-unit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GoodsEntity,
      GoodsCategoryEntity,
      GoodsSpecEntity,
      GoodsSkuEntity,
      GoodsBrandEntity,
      GoodsCommentEntity,
      GoodsCollectionEntity,
      GoodsLabelEntity,
      GoodsUnitEntity,
    ]),
  ],
  controllers: [GoodsController],
  providers: [GoodsService],
  exports: [GoodsService],
})
export class GoodsModule {}