import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { QuestionService } from '../question/question.service';
import { PerformanceService } from './performance.service';
import { User } from '../shared/decorators/user';
import { WxUserDto } from '../auth/auth.dto';
import {
  EstimateCommonQuestionDto,
  EstimateSecondQuestionDto,
  EstimateThirdQuestionDto,
} from '../question/question.dto';

@Controller('performance')
export class PerformanceController {
  constructor(
    private readonly questionService: QuestionService,
    private readonly performanceService: PerformanceService,
  ) {}

  @Get()
  async getPerformanceByUser(@User() user: WxUserDto) {
    return await this.performanceService.count(user.uuid);
  }

  @Post('estimate')
  async estimate(
    @Body()
    dto:
      | EstimateCommonQuestionDto
      | EstimateSecondQuestionDto
      | EstimateThirdQuestionDto,
    @User() user: WxUserDto,
  ) {
    if (dto.type === 1) {
      const result = await this.questionService.estimateCommonQuestion(dto);
      if (result.pass) {
        await this.performanceService.savePass(user.uuid, result.question);
      } else {
        await this.performanceService.saveFail(
          user.uuid,
          result.question,
          result.selectedAnswer,
        );
      }
      return result;
    } else if (dto.type === 2 || dto.type === 3) {
      const result = await this.questionService.estimateSecondQuestion(dto);
      if (result.pass) {
        await this.performanceService.savePass(user.uuid, result.question);
      } else {
        await this.performanceService.saveFail(
          user.uuid,
          result.question,
          result.selectedAnswersArray,
        );
      }
      return result;
    } else {
      throw new BadRequestException('the question was wrong');
    }
  }
}
