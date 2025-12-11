import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationService } from './services/recommendation.service';
import { RecommendationController } from './controllers/recommendation.controller';
import { RecommendationAlgorithmService } from './services/recommendation-algorithm.service';
import { RecommendationCacheService } from './services/recommendation-cache.service';
import { RecommendationAnalyticsService } from './services/recommendation-analytics.service';
import { UserPreferenceEntity } from './entities/user-preference.entity';
import { RecommendationHistoryEntity } from './entities/recommendation-history.entity';
import { RecommendationConfigEntity } from './entities/recommendation-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPreferenceEntity,
      RecommendationHistoryEntity,
      RecommendationConfigEntity,
    ]),
  ],
  controllers: [RecommendationController],
  providers: [
    RecommendationService,
    RecommendationAlgorithmService,
    RecommendationCacheService,
    RecommendationAnalyticsService,
  ],
  exports: [RecommendationService],
})
export class RecommendationModule {}