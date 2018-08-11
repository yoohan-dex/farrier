import { Module } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { QuestionService } from '../question/question.service';
import { PerformanceController } from './performance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Performance } from '../entity/Performance';
import { FailAnswer } from '../entity/FailAnswer';
import { Question } from '../entity/Question';
import { Answer } from '../entity/Answer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Performance, FailAnswer, Question, Answer]),
  ],
  providers: [PerformanceService, QuestionService],
  controllers: [PerformanceController],
})
export class PerformanceModule {}
