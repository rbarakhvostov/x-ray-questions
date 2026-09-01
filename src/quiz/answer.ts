import { normalize } from '../utils/normalize.ts';

export interface Question {
  question_number: number;
  question_text: string;
  options: string[];
  correct_answer: string[] | null;
}

export type PlayableQuestion = Question & { correct_answer: string[] };

export function hasCorrectAnswer(question: Question): question is PlayableQuestion {
  return question.correct_answer !== null;
}

export const getCorrectAnswers = (question: PlayableQuestion) => question.correct_answer.map(normalize);

export function isAnswerCorrect(question: PlayableQuestion, selectedOptions: string[]) {
  const correctAnswers = getCorrectAnswers(question);
  const userAnswers = selectedOptions.map(normalize);

  return correctAnswers.length === userAnswers.length && correctAnswers.every((answer) => userAnswers.includes(answer));
}

export const isMultipleChoice = (question: PlayableQuestion) => getCorrectAnswers(question).length > 1;
