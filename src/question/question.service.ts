import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Not, In } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { Question } from '../entity/Question';
import {
  CreateCommonQuestionDto,
  CreateSecondQuestionDto,
  CreateThirdQuestionDto,
  EstimateCommonQuestionDto,
  EstimateSecondQuestionDto,
  EstimateThirdQuestionDto,
  CreateSubQuestionDto,
} from './question.dto';
import { Answer } from '../entity/Answer';
import { parseFiles } from '../questionsInput/parse';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    private readonly anwserRepository: Repository<Answer>,
  ) {}

  async getQuestionByType(
    type: number,
    page: number = 1,
    size: number = 20,
  ): Promise<Question[]> {
    const options: FindManyOptions<Question> = {
      take: size,
      skip: page ? (page - 1) * 10 : 0,
      relations: ['questions'],
      order: {
        id: 'DESC',
      },
      where: { type },
    };
    const questions = await this.questionRepository.find(options);
    return questions.map(question => ({
      ...question,
      questions:
        question.questions &&
        question.questions.map(subQuestion => ({
          ...subQuestion,
          rightAnswer: subQuestion.rightAnswer.map(
            rightAnswer => 1 * rightAnswer,
          ),
        })),
    }));
  }

  async getQuestionNormal(haveDone: number[] = []) {
    const where = haveDone.length > 0 ? { id: Not(In(haveDone)) } : {};
    const type1query = this.questionRepository.find({
      where: { ...where, type: 1 },
      take: 10,
    });
    const type2query = this.questionRepository.find({
      where: { ...where, type: 2 },
      relations: ['questions'],
      take: 5,
    });
    const type3query = this.questionRepository.find({
      where: { ...where, type: 3 },
      relations: ['questions'],
      take: 5,
    });
    const [type1, type2, type3] = await Promise.all([
      type1query,
      type2query,
      type3query,
    ]);
    return [...type1, ...type2, ...type3];
  }

  async saveCommonQuestion(
    createCommonQuestion:
      | CreateCommonQuestionDto & { parent?: Question }
      | CreateSubQuestionDto,
  ) {
    const answers = await this.saveAnswer(createCommonQuestion.answers);
    const rightAnswer = answers
      .filter(a => createCommonQuestion.rightAnswer.some(v => a.content === v))
      .map(a => a.id);
    const question = new Question();

    question.type = createCommonQuestion.type;
    question.content = createCommonQuestion.content;
    question.answers = answers;
    question.rightAnswer = rightAnswer;
    question.analysis = createCommonQuestion.analysis;
    if (createCommonQuestion.type === 1) {
      question.parent = createCommonQuestion.parent || null;
    }

    return await this.questionRepository.save(question);
  }

  async saveSecondQuestion(createSecondQuestion: CreateSecondQuestionDto) {
    const willSaveQuestion = new Question();
    willSaveQuestion.type = createSecondQuestion.type;
    willSaveQuestion.content = createSecondQuestion.content;
    // const question = await this.questionRepository.save(willSaveQuestion);

    const willSaveSubQuestions = createSecondQuestion.questions.map(async q => {
      const answers = await this.saveAnswer(q.answers);
      const rightAnswer = answers
        .filter(a => q.rightAnswer.some(v => a.content === v))
        .map(a => a.id);
      const willSaveSubQuestion = new Question();
      willSaveSubQuestion.type = 0;
      willSaveSubQuestion.content = q.content;
      willSaveSubQuestion.answers = answers;
      willSaveSubQuestion.rightAnswer = rightAnswer;
      willSaveSubQuestion.analysis = q.analysis;
      return this.questionRepository.save(willSaveSubQuestion);
    });
    const subQuestions = [];
    for (const item of willSaveSubQuestions) {
      subQuestions.push(await item);
    }
    willSaveQuestion.questions = subQuestions;
    const question = await this.questionRepository.save(willSaveQuestion);
    return question;
  }

  async saveThirdQuestion(createThirdQuestion: CreateThirdQuestionDto) {
    const answers = await this.saveAnswer(createThirdQuestion.answers);
    const willSaveSubQuestions = createThirdQuestion.questions.map(q => {
      const question = new Question();
      question.type = q.type;
      question.content = q.content;
      question.analysis = q.analysis;
      question.rightAnswer = answers
        .filter(a => q.rightAnswer.some(v => a.content === v))
        .map(a => a.id);
      return question;
    });
    const subQuestions = await this.questionRepository.save(
      willSaveSubQuestions,
    );

    const question = new Question();
    question.type = createThirdQuestion.type;
    question.answers = answers;
    question.questions = subQuestions;

    return await this.questionRepository.save(question);
  }

  async estimateCommonQuestion(dto: EstimateCommonQuestionDto) {
    const { selectedAnswers } = dto;
    console.log('dto', dto);
    const question = await this.questionRepository.findOne(dto.questionId);
    let allTrue = question.rightAnswer.length === selectedAnswers.length;

    for (const selectedAnswer of selectedAnswers) {
      if (
        !question.rightAnswer
          .map(rightAnswer => rightAnswer * 1)
          .includes(selectedAnswer)
      ) {
        allTrue = false;
      }
    }
    question.rightAnswer = question.rightAnswer.map(v => v * 1);
    return {
      pass: allTrue,
      question,
      selectedAnswer: [
        {
          questionId: question.id,
          selectedAnswers,
        },
      ],
    };
  }

  async estimateSecondQuestion(
    dto: EstimateSecondQuestionDto | EstimateThirdQuestionDto,
  ) {
    const subQuestionIds = dto.subQuestions.map(
      subQuestionDto => subQuestionDto.subQuestionId,
    );
    const subQuestions = await this.questionRepository.findByIds(
      subQuestionIds,
    );
    const pass = subQuestions
      .map((subQuestion, idx) => {
        const { selectedAnswers } = dto.subQuestions[idx];
        let allTrue = subQuestion.rightAnswer.length === selectedAnswers.length;

        for (const selectedAnswer of selectedAnswers) {
          if (
            !subQuestion.rightAnswer
              .map(rightAnswer => rightAnswer)
              .includes(selectedAnswer)
          ) {
            allTrue = false;
          }
        }
        return allTrue;
      })
      .every(allTrue => allTrue);
    const question = await this.questionRepository.findOne(dto.questionId);
    const selectedAnswersArray = dto.subQuestions.map(subQuestion => ({
      questionId: subQuestion.subQuestionId,
      selectedAnswers: subQuestion.selectedAnswers,
    }));
    return {
      pass,
      question,
      selectedAnswersArray,
    };
  }

  async estimateThirdQuestion(dto: EstimateThirdQuestionDto) {
    return await this.estimateSecondQuestion(dto);
  }

  async getFileNParse(): Promise<
    Array<
      CreateCommonQuestionDto | CreateSecondQuestionDto | CreateThirdQuestionDto
    >
  > {
    const newDir = path.join(process.cwd(), './src/questionsInput/new');
    const filePath = type => name =>
      path.join(process.cwd(), `./src/questionsInput/${type}/${name}`);
    const fileList = fs.readdirSync(newDir);
    const files = fileList.map(name =>
      fs.readFileSync(filePath('new')(name), { encoding: 'utf8' }),
    );
    const time = new Date().getTime();
    const savedDir = path.join(
      process.cwd(),
      `./src/questionsInput/saved/${time}`,
    );
    fs.mkdirSync(savedDir);
    for (const name of fileList) {
      fs.copyFileSync(filePath('new')(name), filePath(`saved/${time}`)(name));
      fs.unlinkSync(filePath('new')(name));
    }
    return parseFiles(files);
  }

  async saveAllQuestions(
    dto: Array<
      CreateCommonQuestionDto | CreateSecondQuestionDto | CreateThirdQuestionDto
    >,
  ) {
    const questions = [];
    for (const question of dto) {
      switch (question.type) {
        case 1:
          const savedQuestion1 = await this.saveCommonQuestion(question);
          questions.push(savedQuestion1);
          break;
        case 2:
          const savedQuestion2 = await this.saveSecondQuestion(question);
          questions.push(savedQuestion2);
          break;
        case 3:
          const savedQuestion3 = await this.saveThirdQuestion(question);
          questions.push(savedQuestion3);
      }
    }
    return questions;
  }

  private async saveAnswer(content: string[]) {
    const answers = content.map(c => {
      const answer = new Answer();
      answer.content = c;
      return answer;
    });
    return await this.anwserRepository.save(answers);
  }
}
