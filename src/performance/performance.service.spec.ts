import { Test, TestingModule } from '@nestjs/testing';
import { PerformanceService } from './performance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FailAnswer } from '../entity/FailAnswer';
import { Performance } from '../entity/Performance';
import { WxUser } from '../entity/WxUser';
import { AuthService } from '../auth/auth.service';
import { Question } from '../entity/Question';
import { Answer } from '../entity/Answer';
import { QuestionService } from '../question/question.service';

describe('PerformanceService', () => {
  let service: PerformanceService;
  let authService: AuthService;
  let user: WxUser;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(),
        TypeOrmModule.forFeature([
          Performance,
          FailAnswer,
          WxUser,
          Question,
          Answer,
        ]),
      ],
      providers: [PerformanceService, AuthService, QuestionService],
    }).compile();
    service = module.get<PerformanceService>(PerformanceService);
    authService = module.get<AuthService>(AuthService);

    user = await authService.getOneUser();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
