import { Test, TestingModule } from '@nestjs/testing';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from '../entity/Question';
import { Answer } from '../entity/Answer';

describe('Question Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(),
        TypeOrmModule.forFeature([Question, Answer]),
      ],
      controllers: [QuestionController],
      providers: [QuestionService],
    }).compile();
  });
  it('should be defined', () => {
    const controller: QuestionController = module.get<QuestionController>(
      QuestionController,
    );
    expect(controller).toBeDefined();
  });
});
