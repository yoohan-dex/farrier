import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Performance } from '../entity/Performance';
import { Question } from '../entity/Question';
import { FailAnswer } from '../entity/FailAnswer';
import { SelectAnswer } from './interface';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(Performance)
    private readonly performanceRepository: Repository<Performance>,
    @InjectRepository(FailAnswer)
    private readonly failAnswerRepository: Repository<FailAnswer>,
  ) {}

  async count(user: string) {
    const performance = await this.performanceRepository.findOne({ user });

    const passCount = performance.pass.length;
    const failCount = performance.fail.length;
    return {
      count: passCount + failCount,
      passCount,
      failCount,
    };
  }

  async findFailedQuestion(user: string) {
    const performance = await this.performanceRepository.findOne({ user });
    const { fail, failAnswers } = performance;
    const count = fail.length;
    return {
      count,
      failQuestions: fail,
      failAnswers,
    };
  }

  async findDone(user: string): Promise<number[]> {
    const performance = await this.performanceRepository.findOne({ user });
    if (!performance) {
      return [];
    }
    const { fail, pass } = performance;
    return [...fail, ...pass];
  }

  async savePass(user: string, question: Question) {
    const performance = await this.performanceRepository.findOne({ user });
    performance.pass.push(question.id);

    // check if the user have fail this question
    const failQuestionIdx = performance.fail.indexOf(question.id);

    if (failQuestionIdx !== -1) {
      performance.fail.splice(failQuestionIdx, 1);
    }

    return await this.performanceRepository.save(performance);
  }

  async saveFail(
    user: string,
    question: Question,
    selectAnswers: SelectAnswer[],
  ) {
    const performance = await this.findPerformanceByUser(user);

    const willSaveFailAnswers = selectAnswers.map(selectAnswer => {
      const failAnswer = new FailAnswer();
      failAnswer.questionId = selectAnswer.questionId;
      failAnswer.selectedAnswer = selectAnswer.selectedAnswers;
      return failAnswer;
    });

    const failAnswers = await this.failAnswerRepository.save(
      willSaveFailAnswers,
    );
    performance.fail.push(question.id);
    performance.failAnswers.push(...failAnswers);
    await this.performanceRepository.save(performance);
  }

  private async findPerformanceByUser(user: string) {
    const performance = await this.performanceRepository.findOne({ user });
    if (!performance) {
      const newPerformance = new Performance();
      newPerformance.user = user;
      newPerformance.fail = [];
      newPerformance.pass = [];
      newPerformance.failAnswers = [];
      return newPerformance;
    }
    return performance;
  }
}
