import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { DbConnectionService } from '../../common/database/db-connection.service';

@Module({
  imports: [],
  controllers: [SearchController],
  providers: [SearchService, DbConnectionService],
  exports: [SearchService],
})
export class SearchModule {}

