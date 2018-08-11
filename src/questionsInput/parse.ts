import * as fs from 'fs';
import * as signale from 'signale';

import {
  CreateCommonQuestionDto,
  CreateSecondQuestionDto,
  CreateThirdQuestionDto,
  CreateSubQuestionDto,
} from '../question/question.dto';

// const fileList = fs.readdirSync('./new');
// const files = fileList.map(name =>
//   fs.readFileSync(`./new/${name}`, { encoding: 'utf8' }),
// );
const replaceAll = (str: string, targetStr: string, replaceStr: string) => {
  const idx = str.indexOf(targetStr);
  if (idx === -1) {
    return str;
  }
  return (
    str.slice(0, idx) +
    replaceStr +
    replaceAll(str.slice(idx + 1), targetStr, replaceStr)
  );
};
const getType = (file: string) => parseInt(file[1], 10);
const removeType = (file: string) => file.slice(4);
const split = (content: string) => content.split('=\n=');
const filterN = (content: string[]) =>
  content.filter(s => s !== '\n' && s !== '');
const splitSubQuestions = (content: string) =>
  replaceAll(content, '\n+', '\n+++').split('+++');
const removeTailN = (str: string) => {
  if (str[str.length - 1] === '\n') {
    return str.slice(0, str.length - 1);
  }
  return str;
};

const getContent = (strs: string[]) => {
  const s = strs[0].trim();
  if (s.indexOf('+') === 0) {
    return s.slice(1);
  }
  return s;
};
const getAnswer = (content: string[]) => content.slice(1);
const getRight = (answers: string[]) => answers.filter(s => s[0] === '*');
const removeAnswerTag = (answers: string[]) =>
  answers.map(s => s.slice(1).trim());

const lowWords = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const getRightAnswerIndies = (str: string) => {
  str = replaceAll(str, ' ', '');
  const indies = [];
  if (str.length > 1) {
    for (const answer of str) {
      const word = answer.toLowerCase();
      const idx = lowWords.indexOf(word);
      if (idx === -1) {
        throw new Error('小写字母不够 或者 题有问题');
      }
      indies.push(idx);
    }
  } else {
    const idx = lowWords.indexOf(str.toLowerCase());

    if (idx === -1) {
      throw new Error('小写字母不够 或者 题有问题');
    }
    indies.push(idx);
  }
  return indies;
};

const parseOne = (file: string, name: string): CreateCommonQuestionDto[] => {
  signale.debug(`start parse file ${name}`);
  const type = getType(file);
  signale.debug('type', type);
  if (type === 1) {
    file = removeType(file);
  } else {
    throw new Error('error! 1');
  }
  const questions = filterN(split(file));
  return questions.map((question, i) => {
    const explainIdx = question.indexOf('|>');
    const questionContentStr = question.slice(0, explainIdx);
    const analysis = removeTailN(question.slice(explainIdx + 2));
    const questionContent = filterN(questionContentStr.split('\n'));
    // * main question content
    const content = getContent(questionContent);

    // * all answers
    const answers = removeAnswerTag(getAnswer(questionContent));

    // * right answers
    const rightAnswer = removeAnswerTag(getRight(getAnswer(questionContent)));

    const q = {
      type,
      content,
      analysis,
      answers,
      rightAnswer,
    } as CreateCommonQuestionDto;
    return q;
  });
};

const parseTwo = (file: string, name: string): CreateSecondQuestionDto[] => {
  signale.debug(`start parse file ${name}`);
  const type = getType(file);
  signale.debug('type', type);
  if (type === 2) {
    file = removeType(file);
  }

  const questions = filterN(split(file));
  return questions.map((question, i) => {
    // const explainIdx = question.indexOf('|>');
    // const questionContentStr = question.slice(0, explainIdx);
    // const analysis = question.slice(explainIdx + 2);
    // const questionContent = filterN(questionContentStr.split('\n'));
    const questionsStr = filterN(splitSubQuestions(question));
    // * main question content
    const content = replaceAll(getContent(questionsStr), '\n', '');

    const subquestionsStrs = questionsStr.slice(1);
    const subQuestions: CreateSubQuestionDto[] = subquestionsStrs.map(
      subquestionsStr => {
        const explainIdx = subquestionsStr.indexOf('|>');
        const questionContentStr = subquestionsStr.slice(0, explainIdx);
        const analysis = removeTailN(
          explainIdx !== -1 ? subquestionsStr.slice(explainIdx + 2) : '',
        );
        const subQuestionContent = filterN(questionContentStr.split('\n'));

        const subContent = getContent(subQuestionContent);
        const subAnswers = removeAnswerTag(getAnswer(subQuestionContent));
        const subRightAnswer = removeAnswerTag(
          getRight(getAnswer(subQuestionContent)),
        );

        return {
          type: 0,
          content: subContent,
          answers: subAnswers,
          rightAnswer: subRightAnswer,
          analysis,
        } as CreateSubQuestionDto;
      },
    );
    return {
      type,
      content,
      questions: subQuestions,
    } as CreateSecondQuestionDto;
  });
};

const parseThree = (file: string, name: string): CreateThirdQuestionDto[] => {
  signale.debug(`start parse file ${name}`);
  const type = getType(file);
  signale.debug('type', type);
  if (type === 3) {
    file = removeType(file);
  }

  // todo
  const questions = filterN(split(file));
  return questions.map((question, i, arr) => {
    const answerNquestionsStr = splitSubQuestions(question);
    const answersStr = answerNquestionsStr[0];
    const subQuestionsStrArray = answerNquestionsStr.slice(1);
    const answers = filterN(answersStr.split('\n'))
      .map(v => v.slice(3))
      .filter(v => v.trim() !== '');
    const subQuestions = subQuestionsStrArray.map(subquestionsStr => {
      const explainIdx = subquestionsStr.indexOf('|>');
      const questionContentNrightAnswerStr = subquestionsStr.slice(
        0,
        explainIdx,
      );
      const analysis = removeTailN(
        explainIdx !== -1 ? subquestionsStr.slice(explainIdx + 2) : '',
      );

      const contentNrightAnswerArr = filterN(
        questionContentNrightAnswerStr.split('\n'),
      ).reduce((pre, curr) => {
        const len = pre.length;
        if (len === 0) {
          return [curr];
        }
        if (!lowWords.includes(pre[len - 1][0].toLowerCase())) {
          if (lowWords.includes(curr[0].toLowerCase())) {
            return [...pre, curr];
          } else {
            return [...pre.slice(0, len - 1), `${pre[len - 1]}${curr}`];
          }
        } else {
          return [...pre, curr];
        }
      }, []);
      const content = getContent(contentNrightAnswerArr);
      const rightAnswer = getRightAnswerIndies(contentNrightAnswerArr[1]).map(
        idx => answers[idx],
      );
      return {
        type: 0,
        content,
        rightAnswer,
        analysis,
      };
    });

    return {
      type,
      answers,
      questions: subQuestions,
    } as CreateThirdQuestionDto;
  });
};

// const questionsOne = parseOne(files[0], 'a1');
// console.log(questionsOne[0]);
// const questionsThree = parseThree(files[3], 'b1');
// console.log(questionsThree[1]);
export const parseFiles = (localFiles: string[]) => {
  return localFiles.reduce((pre, curr) => {
    const type = getType(curr);
    switch (type) {
      case 1:
        return pre.concat(parseOne(curr, `题型${type}`));
      case 2:
        return pre.concat(parseTwo(curr, `题型${type}`));
      case 3:
        return pre.concat(parseThree(curr, `题型${type}`));

      default:
        return pre;
    }
  }, []);
};
