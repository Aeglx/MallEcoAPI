import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { Order } from '../../modules/client/common/order/entities/order.entity';
import { OrderItem } from '../../modules/client/common/order/entities/order-item.entity';
import { User } from '../../modules/client/comm../infrastructure/auth/entities/user.entity';
import { Article } from '../../modules/client/common/content/entities/article.entity';
import { ArticleCategory } from '../../modules/client/common/content/entities/article-category.entity';
import { ArticleComment } from '../../modules/client/common/content/entities/article-comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Order, OrderItem, User, Article, ArticleCategory, ArticleComment]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}


