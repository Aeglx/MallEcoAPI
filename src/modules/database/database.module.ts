import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseOptimizationController } from './controllers/database-optimization.controller';
import { DatabaseOptimizationService } from './services/database-optimization.service';
import { DatabaseAnalysisService } from './services/database-analysis.service';
import { DatabasePerformanceEntity } from './entities/database-performance.entity';
import { DatabaseIndexEntity } from './entities/database-index.entity';
import { DatabaseQueryEntity } from './entities/database-query.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    DatabasePerformanceEntity,
    DatabaseIndexEntity,
    DatabaseQueryEntity
  ])],
  controllers: [DatabaseOptimizationController],
  providers: [DatabaseOptimizationService, DatabaseAnalysisService],
  exports: [DatabaseOptimizationService, DatabaseAnalysisService]
})
export class DatabaseModule {}