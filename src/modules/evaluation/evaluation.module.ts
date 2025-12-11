import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationController } from './controllers/evaluation.controller';
import { EvaluationService } from './services/evaluation.service';
import { EvaluationEntity } from './entities/evaluation.entity';
import { EvaluationReplyEntity } from './entities/evaluation-reply.entity';
import { EvaluationLikeEntity } from './entities/evaluation-like.entity';
import { EvaluationReportEntity } from './entities/evaluation-report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EvaluationEntity,
      EvaluationReplyEntity,
      EvaluationLikeEntity,
      EvaluationReportEntity,
    ]),
  ],
  controllers: [EvaluationController],
  providers: [EvaluationService],
  exports: [EvaluationService],
})
export class EvaluationModule {}