import { normalize } from '../utils/normalize.ts';

export interface Question {
  question_number: number;
  question_text: string;
  options: string[];
  correct_answer: string[];
}

export const getCorrectAnswers = (question: Question) => question.correct_answer.map(normalize);

export function isAnswerCorrect(question: Question, selectedOptions: string[]) {
  const correctAnswers = getCorrectAnswers(question);
  const userAnswers = selectedOptions.map(normalize);

  return correctAnswers.length === userAnswers.length && correctAnswers.every((answer) => userAnswers.includes(answer));
}

export const isMultipleChoice = (question: Question) => getCorrectAnswers(question).length > 1;
