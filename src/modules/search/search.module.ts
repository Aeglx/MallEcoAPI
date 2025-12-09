import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { DbConnectionService } from '../../common/database/db-connection.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ProductsModule } from '../../products/products.module';

@Module({
  imports: [
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
  providers: [SearchService, DbConnectionService],
})
export class SearchModule {}
