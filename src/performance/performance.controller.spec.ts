import { Test, TestingModule } from '@nestjs/testing';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FailAnswer } from '../entity/FailAnswer';
import { Performance } from '../entity/Performance';
import { QuestionService } from '../question/question.service';
import { Question } from '../entity/Question';
import { Answer } from '../entity/Answer';

describe('Performance Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(),
        TypeOrmModule.forFeature([Performance, FailAnswer, Question, Answer]),
      ],
      controllers: [PerformanceController],
      providers: [PerformanceService, QuestionService],
    }).compile();
  });
  it('should be defined', () => {
    const controller: PerformanceController = module.get<PerformanceController>(
      PerformanceController,
    );
    expect(controller).toBeDefined();
  });
});
