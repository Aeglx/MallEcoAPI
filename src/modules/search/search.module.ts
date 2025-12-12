import { Module, CacheModule } from '@nestjs/common';
import { SearchController } from './infrastructure/search.controller';
import { SearchService } from './infrastructure/search.service';
import { SearchCacheService } from './infrastructure/search-cache.service';
import { DbConnectionService } from '../../common/database/db-connection.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ProductsModule } from '../../products/products.module';

@Module({
  imports: [
    CacheModule.register(),
    ElasticsearchModule.registerAsync({
      useFactory: () => ({
        node: process.env.ELASTICSEARCH_NODE,
        auth: {
          username: process.env.ELASTICSEARCH_USERNAME,
          password: process.env.ELASTICSEARCH_PASSWORD,
        },
      }),
    }),
    ProductsModule,
  ],
  controllers: [SearchController],
  providers: [SearchService, SearchCacheService, DbConnectionService],
})
export class SearchModule {}

