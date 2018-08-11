import { Controller, Get, Param, Query } from '@nestjs/common';
import { QuestionService } from './question.service';
import { parseFiles } from '../questionsInput/parse';
import { User } from '../shared/decorators/user';
import { WxUser } from '../entity/WxUser';
import { PerformanceService } from '../performance/performance.service';

@Controller('question')
export class QuestionController {
  constructor(
    private readonly questionService: QuestionService,
    private readonly performanceService: PerformanceService,
  ) {}

  @Get()
  async getQuestionByType(
    @Query('type') type: number,
    @Query('page') page: number,
    @Query('size') size: number,
  ) {
    return await this.questionService.getQuestionByType(type, page, size);
  }

  @Get('normal')
  async getQuestionNormal(@User() user: WxUser) {
    const haveDoneIds = await this.performanceService.findDone(user.uuid);
    return await this.questionService.getQuestionNormal(haveDoneIds);
  }

  @Get('trigger/create')
  async triggerCreateQuestions() {
    const questions = await this.questionService.getFileNParse();
    return await this.questionService.saveAllQuestions(questions);
  }
}
