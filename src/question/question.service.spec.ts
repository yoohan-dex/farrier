import { Test, TestingModule } from '@nestjs/testing';
import { QuestionService } from './question.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from '../entity/Question';
import { Answer } from '../entity/Answer';
import {
  CreateSecondQuestionDto,
  CreateThirdQuestionDto,
  CreateSubQuestionDto,
  CreateCommonQuestionDto,
  EstimateCommonQuestionDto,
} from './question.dto';

const mockCommonQuestion: CreateCommonQuestionDto = {
  type: 1,
  content: 'this is a question and 中文',
  answers: ['answer1', 'answer2', 'answer3', 'answer4'],
  rightAnswer: ['answer3'],
  analysis: 'then i am analysis',
};

const subCommonQuestion: CreateSubQuestionDto = {
  type: 0,
  content: 'this is a question and 中文',
  answers: ['answer1', 'answer2', 'answer3', 'answer4'],
  rightAnswer: ['answer3'],
  analysis: 'then i am analysis',
};

const mockSecondQuestion: CreateSecondQuestionDto = {
  type: 2,
  content: 'whatever you write',
  questions: [subCommonQuestion, subCommonQuestion],
};

const mockThirdQuestion: CreateThirdQuestionDto = {
  type: 3,
  answers: ['answer1', 'answer2', 'answer3', 'answer4'],
  questions: [subCommonQuestion, subCommonQuestion],
};

describe('QuestionService', () => {
  let service: QuestionService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(),
        TypeOrmModule.forFeature([Question, Answer]),
      ],
      providers: [QuestionService],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should can save a new common question', async () => {
    const commonQuestionMatch = {
      id: expect.any(Number),
      type: mockCommonQuestion.type,
      answers: mockCommonQuestion.answers.map(answer => ({
        id: expect.any(Number),
        content: answer,
      })),
      parent: null,
      content: mockCommonQuestion.content,
      analysis: mockCommonQuestion.analysis,
      rightAnswer: [expect.any(Number)],
    };
    const question = await service.saveCommonQuestion(mockCommonQuestion);
    expect(question).toMatchSnapshot(commonQuestionMatch);
  });

  it('should can save a new second question', async () => {
    const subQuestionMatch = {
      id: expect.any(Number),
      type: subCommonQuestion.type,
      answers: subCommonQuestion.answers.map(answer => ({
        id: expect.any(Number),
        content: answer,
      })),
      content: subCommonQuestion.content,
      analysis: subCommonQuestion.analysis,
      rightAnswer: [expect.any(Number)],
    };
    const question = await service.saveSecondQuestion(mockSecondQuestion);
    expect(question).toMatchSnapshot({
      id: expect.any(Number),
      type: mockSecondQuestion.type,
      content: mockSecondQuestion.content,
      questions: [subQuestionMatch, subQuestionMatch],
      analysis: null,
      rightAnswer: null,
    });
  });

  it('should can save a new third question', async () => {
    const subQuestionMatch = {
      id: expect.any(Number),
      type: subCommonQuestion.type,
      content: subCommonQuestion.content,
      analysis: subCommonQuestion.analysis,
      rightAnswer: [expect.any(Number)],
    };
    const question = await service.saveThirdQuestion(mockThirdQuestion);
    expect(question).toMatchSnapshot({
      id: expect.any(Number),
      type: mockThirdQuestion.type,
      answers: mockThirdQuestion.answers.map(answer => ({
        id: expect.any(Number),
        content: answer,
      })),
      questions: [subQuestionMatch, subQuestionMatch],
      content: null,
      rightAnswer: null,
      analysis: null,
    });
  });

  it('should can get questions by type and by pager', async () => {
    const subQuestionMatch = {
      id: expect.any(Number),
      type: subCommonQuestion.type,
      content: subCommonQuestion.content,
      analysis: subCommonQuestion.analysis,
      rightAnswer: [expect.any(Number)],
      answers: [],
    };
    const questions = await service.getQuestionByType(3, 1, 1);
    expect(questions).toMatchSnapshot([
      {
        id: expect.any(Number),
        type: 3,
        answers: mockThirdQuestion.answers.map(answer => ({
          id: expect.any(Number),
          content: answer,
        })),
        questions: [subQuestionMatch, subQuestionMatch],
        content: null,
        rightAnswer: null,
        analysis: null,
      },
    ]);
  });

  it('will estimate a common question', async () => {
    const [question] = await service.getQuestionByType(1, 1, 1);
    const dto: EstimateCommonQuestionDto = {
      questionId: question.id,
      selectedAnswers: [8],
      type: 1,
    };
    const result = await service.estimateCommonQuestion(dto);
    expect(result).toMatchSnapshot({
      pass: false,
      question: {
        id: expect.any(Number),
        type: mockCommonQuestion.type,
        answers: mockCommonQuestion.answers.map(answer => ({
          id: expect.any(Number),
          content: answer,
        })),
        content: mockCommonQuestion.content,
        analysis: mockCommonQuestion.analysis,
        rightAnswer: [expect.any(Number)],
      },
      selectedAnswer: [
        {
          questionId: expect.any(Number),
          selectedAnswers: [8],
        },
      ],
    });
  });
});
