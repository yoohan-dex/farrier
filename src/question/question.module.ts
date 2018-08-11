import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from '../entity/Question';
import { Answer } from '../entity/Answer';
import { QuestionController } from './question.controller';
import { FailAnswer } from '../entity/FailAnswer';
import { Performance } from '../entity/Performance';
import { PerformanceService } from '../performance/performance.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, Answer, Performance, FailAnswer]),
  ],
  providers: [QuestionService, PerformanceService],
  controllers: [QuestionController],
})
export class QuestionModule {}
