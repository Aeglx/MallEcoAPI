import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShardingService } from './sharding.service';
import { ShardingTransactionManager } from './sharding.transaction.manager';

@Module({
  imports: [TypeOrmModule],
  providers: [ShardingService, ShardingTransactionManager],
  exports: [ShardingService, ShardingTransactionManager],
})
export class ShardingModule {}
