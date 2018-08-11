export class CreateSubQuestionDto {
  type: 0;
  content: string;
  answers: string[];
  rightAnswer: string[];
  analysis: string;
}

export class CreateCommonQuestionDto {
  type: 1;
  content: string;
  answers: string[];
  rightAnswer: string[];
  analysis: string;
}

export class CreateSecondQuestionDto {
  type: 2;
  content: string;
  questions: CreateSubQuestionDto[];
}

export class CreateThirdQuestionDto {
  type: 3;
  answers: string[];
  questions: {
    type: number;
    content: string;
    rightAnswer: string[];
    analysis: string;
  }[];
}

export class EstimateCommonQuestionDto {
  type: 1;
  questionId: number;
  selectedAnswers: number[];
}

export class EstimateSecondQuestionDto {
  type: 2;
  questionId: number;
  subQuestions: {
    subQuestionId: number;
    selectedAnswers: number[];
  }[];
}

export class EstimateThirdQuestionDto {
  type: 3;
  questionId: number;
  subQuestions: {
    subQuestionId: number;
    selectedAnswers: number[];
  }[];
}
