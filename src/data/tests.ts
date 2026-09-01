import { hasCorrectAnswer, Question } from '../quiz/answer.ts';
import { bioethicsQuestions } from './bioethicsQuestions.ts';
import { rawQuestions } from './questions.ts';

export type TestId = 'radiology' | 'bioethics';

export interface QuizTest {
  id: TestId;
  title: string;
  questions: Question[];
}

export const tests: Record<TestId, QuizTest> = {
  radiology: {
    id: 'radiology',
    title: 'Рентгенография',
    questions: rawQuestions,
  },
  bioethics: {
    id: 'bioethics',
    title: 'Биоэтика',
    questions: bioethicsQuestions,
  },
};

export const testList: QuizTest[] = [tests.radiology, tests.bioethics];

export function getPlayableCount(test: QuizTest) {
  return test.questions.filter(hasCorrectAnswer).length;
}

export function formatQuestionCount(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return `${count} вопросов`;
  }

  if (last === 1) {
    return `${count} вопрос`;
  }

  if (last >= 2 && last <= 4) {
    return `${count} вопроса`;
  }

  return `${count} вопросов`;
}
